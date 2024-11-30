interface LogMessagesArgs {
    /** The console method to use when logging the messages. Default: 'error' */
    level?: 'error' | 'warning' | 'debug';
    /** The messages to log */
    messages: unknown[];
    /** When `true` prevents all logging */
    suppressErrors?: boolean;
}

/** Logs messages to the console. Uses `console.error` by default. */
export function logMessages({ level = 'error', messages, suppressErrors = false }: LogMessagesArgs) {
    if (!suppressErrors) {
        if (level === 'error') {
            console.error(messages);
        } else if (level === 'warning') {
            console.warn(messages);
        } else {
            console.debug(messages);
        }
    }
}