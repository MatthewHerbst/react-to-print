import { afterEach, describe, expect, it, vi } from "vitest";

import { logMessages } from "./logMessage";

describe("logMessages", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("logs with console.error by default", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        logMessages({ messages: ["oops"] });
        expect(spy).toHaveBeenCalledWith(["oops"]);
    });

    it("logs with console.warn for the warning level", () => {
        const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        logMessages({ level: "warning", messages: ["careful"] });
        expect(spy).toHaveBeenCalledWith(["careful"]);
    });

    it("logs with console.debug for the debug level", () => {
        const spy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
        logMessages({ level: "debug", messages: ["details"] });
        expect(spy).toHaveBeenCalledWith(["details"]);
    });

    it("does not log anything when suppressErrors is true", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);

        logMessages({ messages: ["nope"], suppressErrors: true });
        logMessages({ level: "warning", messages: ["nope"], suppressErrors: true });
        logMessages({ level: "debug", messages: ["nope"], suppressErrors: true });

        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(debugSpy).not.toHaveBeenCalled();
    });
});
