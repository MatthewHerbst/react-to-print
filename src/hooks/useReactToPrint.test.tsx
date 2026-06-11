import React, { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook } from "@testing-library/react";

// Keep an explicit reference so the classic JSX runtime (eslint `react/react-in-jsx-scope`) is satisfied
void React;

import { useReactToPrint } from "./useReactToPrint";
import { DEFAULT_PRINT_WINDOW_ID } from "../consts";
import type { UseReactToPrintOptions } from "../types/UseReactToPrintOptions";

/**
 * jsdom does not implement `iframe.contentWindow.print`, so these tests drive the flow through the
 * custom `print` option (a Promise), which exercises the same path that triggers `onAfterPrint`,
 * iframe cleanup, and error handling. Real `window.print` behavior is covered by the Playwright
 * smoke tests.
 */

/** Renders the hook against a freshly-mounted content node and returns the print callback. */
function setup(options: Omit<UseReactToPrintOptions, "contentRef">) {
    const { result } = renderHook(() => {
        const contentRef = useRef<HTMLDivElement>(null);
        const handlePrint = useReactToPrint({ ...options, contentRef });
        return { contentRef, handlePrint };
    });

    // Mount actual content for the ref to point at
    render(<div ref={result.current.contentRef}>printable content</div>);

    return result;
}

describe("useReactToPrint", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("returns a stable callback", () => {
        const result = setup({});
        expect(typeof result.current.handlePrint).toBe("function");
    });

    it("runs onBeforePrint before mounting the print iframe", async () => {
        const order: string[] = [];
        const onBeforePrint = vi.fn(() => {
            order.push("before");
            return Promise.resolve();
        });
        const print = vi.fn(() => {
            order.push("print");
            return Promise.resolve();
        });

        const result = setup({ onBeforePrint, print });

        await act(async () => {
            result.current.handlePrint();
            await vi.runAllTimersAsync();
        });

        expect(onBeforePrint).toHaveBeenCalledOnce();
        expect(print).toHaveBeenCalledOnce();
        expect(order).toEqual(["before", "print"]);
    });

    it("calls the custom print function and then onAfterPrint", async () => {
        const print = vi.fn((target: HTMLIFrameElement) => {
            // Reference the param so its type is captured and the call signature is `(HTMLIFrameElement)`
            void target;
            return Promise.resolve();
        });
        const onAfterPrint = vi.fn();

        const result = setup({ print, onAfterPrint });

        await act(async () => {
            result.current.handlePrint();
            await vi.runAllTimersAsync();
        });

        expect(print).toHaveBeenCalledOnce();
        // The custom print receives the print iframe
        expect(print.mock.calls[0][0]).toBeInstanceOf(HTMLIFrameElement);
        expect(onAfterPrint).toHaveBeenCalledOnce();
    });

    it("routes onBeforePrint rejections to onPrintError and does not print", async () => {
        const print = vi.fn(() => Promise.resolve());
        const onPrintError = vi.fn();
        const onBeforePrint = vi.fn(() => Promise.reject(new Error("nope")));

        const result = setup({ onBeforePrint, onPrintError, print });

        await act(async () => {
            result.current.handlePrint();
            await vi.runAllTimersAsync();
        });

        expect(onPrintError).toHaveBeenCalledOnce();
        expect(onPrintError.mock.calls[0][0]).toBe("onBeforePrint");
        expect(onPrintError.mock.calls[0][1]).toBeInstanceOf(Error);
        expect(print).not.toHaveBeenCalled();
    });

    it("removes the print iframe after printing by default", async () => {
        const print = vi.fn(() => Promise.resolve());

        const result = setup({ print });

        await act(async () => {
            result.current.handlePrint();
            await vi.runAllTimersAsync();
        });

        expect(document.getElementById(DEFAULT_PRINT_WINDOW_ID)).toBeNull();
    });

    it("logs and does nothing when there is no content to print", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const print = vi.fn(() => Promise.resolve());

        // No content mounted: the ref stays null
        const { result } = renderHook(() => {
            const contentRef = useRef<HTMLDivElement>(null);
            return useReactToPrint({ contentRef, print });
        });

        await act(async () => {
            result.current();
            await vi.runAllTimersAsync();
        });

        expect(errorSpy).toHaveBeenCalled();
        expect(print).not.toHaveBeenCalled();
    });
});
