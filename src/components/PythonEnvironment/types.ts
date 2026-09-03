
export interface IPythonEnvironment {
    readonly state: EnvironmentState;
    subscribeStateChanges(cb: OnStateChangesCallback): void;

    setup: () => Promise<void>;
    terminate(): void;

    registerMainThreadFunction(fnName: string, fn: MainThreadCallback): void;

    /**
     * Receive from main, run on Pyodide, and return to main.
     *
     * @param script - Source code that will runs on Pyodide.
     * @param globals - Global variables to the script.
     *
     * @returns The last evaluated value or undefined.
     */
    runCodeOnWorker(
        script: string,
        options?: {
            globals?: TransferObject<Record<string, any>>,
            printRepr?: boolean,
        }
    ): Promise<any>;

    /**
     * Call a Python function on the worker and returns its result.
     *
     * @param fnName - Function name that will be called. May be the fully
     *               qualififed name like package.module.submod.function.
     * @param args - Positional arguments (*args list).
     * @param kwargs - Keywords arguments (**kwargs dict).
     * @param moduleName - If you need to specify the object.method on `fnName`,
     *                      this optional field holds the package.module.submod.
     *
     * @returns The return value of the function.
     */
    callWorkerFunction(
        functionName: string,
        args: any[],
        kwargs?: Record<string, any>,
        moduleName?: string,
    ): Promise<any>;

    configureStdout(callback: StdoutCallback): void;
    configureStderr(callback: StdoutCallback): void;
}


export type PythonCallable = (...args: any[]) => any;

export type StdoutCallback = (text: string) => void;
export type StderrCallback = (text: string) => void;

export type EnvironmentState =
    'DOWN' | 'INITIALIZING' | 'WORKING' | 'FAILED';
export type OnStateChangesCallback = (newState: EnvironmentState, error?: string) => void;

export type MainThreadCallback = (...args: any[]) => any;

export type TransferObject<T = any> = { data: T }