import { describe, expect, it } from "vitest";

import { getErrorFromUnknown } from "./getErrorMessage";

describe("getErrorFromUnknown", () => {
    it("returns the same Error instance when given an Error", () => {
        const error = new Error("boom");
        expect(getErrorFromUnknown(error)).toBe(error);
    });

    it("preserves subclasses of Error", () => {
        const error = new TypeError("bad type");
        expect(getErrorFromUnknown(error)).toBe(error);
    });

    it("wraps non-Error values in a generic Error", () => {
        const result = getErrorFromUnknown("a string");
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("Unknown Error");
    });

    it("wraps null/undefined in a generic Error", () => {
        expect(getErrorFromUnknown(null).message).toBe("Unknown Error");
        expect(getErrorFromUnknown(undefined).message).toBe("Unknown Error");
    });
});
