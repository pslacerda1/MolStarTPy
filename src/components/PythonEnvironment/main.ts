import { Logger } from "../../utils";
import { PythonEnvironment } from "./environment";
import { PythonCallable, TransferObject } from "./types";
import { toTransfer } from "./utils";


const log = Logger()

/**
 * Javascript functions accessible to main thread.
 */

const MAIN_PYTHON_FUNCTIONS: Map<string, PythonCallable> = new Map();

export function intoPythonFromMain<T extends PythonCallable>(cmd: T): T;
export function intoPythonFromMain<T extends PythonCallable>(cmdName: string, cmd: T): T;
export function intoPythonFromMain<T extends PythonCallable>(cmdOrName: string | T, maybeCmd?: T): T {
    let fn: T;
    let fnName: string;

    if (typeof cmdOrName === 'function') {
         // cmd only
        fn = cmdOrName
        fnName = fn.name;
    } else {
        // name & cmd
        fnName = cmdOrName;
        if (!maybeCmd)
            throw new Error('A function must be provided when specifying a name.');
        fn = maybeCmd;
    }
    if (!fnName)
        throw new Error('Anonymous functions require an explicit name.');

    if (MAIN_PYTHON_FUNCTIONS.has(fnName))
        throw new Error("Could not register with the same name.");

    async function impl(...args: Parameters<T>) {
        try {
            return await fn(...args);
        } catch (err: any) {
            log.error(`Unexpected failure at py/js frontier in ${fnName}`, err);
            throw err;
        }
    }

    log.debug(`Will register ${fnName} function to run on the main thread.`);
    Object.defineProperty(impl, 'name', { value: fnName });
    MAIN_PYTHON_FUNCTIONS.set(fnName, impl);

    const python = PythonEnvironment('main');
    python.registerMainThreadFunction(fnName, impl);

    // @ts-ignore
    return fn;
}
