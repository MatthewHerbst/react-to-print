/**
 * This function helps to curry arguments to a bound function
 * and partially apply them at the end of the argument list. 
 */
export function wrapCallbackWithArgs<CallbackReturnValue, BoundObject>(
    thisArg: BoundObject,
    callback: (...curryArgs: any[]) => CallbackReturnValue,
    ...predefinedArgs: unknown[]
) {
    return function (...args: unknown[]) {
      return callback.apply(thisArg, [...args, ...predefinedArgs]);
    };
}