export function getErrorFromUnknown(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error("Unknown Error");
}