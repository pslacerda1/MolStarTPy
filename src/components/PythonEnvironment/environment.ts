import { useEffect, useRef, } from 'react';
import {
    EnvironmentState,
    OnStateChangesCallback,
    MainThreadCallback,
    StderrCallback,
    StdoutCallback,
    TransferObject,
    IPythonEnvironment,
} from './types';
import { type PythonWorkerApi } from './worker';
import * as Comlink from 'comlink';
import { Logger } from '../../utils';
import { toTransfer } from './utils';

const log = Logger();

const ENVIRONMENT_STORE: Map<string, IPythonEnvironment> = new Map();

export function PythonEnvironment(id?: string): IPythonEnvironment {
    if (id !== undefined && ENVIRONMENT_STORE.has(id)) {
        return ENVIRONMENT_STORE.get(id)!;
    }

    let state: EnvironmentState = 'DOWN';
    let isSettingUp: boolean = false;

    let rawWorker: Worker | null = null;
    let worker: Comlink.Remote<PythonWorkerApi> | null = null;

    const stateListeners = new Set<OnStateChangesCallback>();
    const mainThreadFunctions = new Map<string, MainThreadCallback>();

    function getWorker() {
        if (!worker) {
            rawWorker = new Worker(
                new URL('./worker.ts', import.meta.url),
                { type: 'module' }
            );
            worker = Comlink.wrap<PythonWorkerApi>(rawWorker);
        }
        return worker;
    }
    function notifyState(newState: EnvironmentState, error?: string) {
        state = newState;
        stateListeners.forEach((cb) => cb(newState, error));
    }

    function subscribeStateChanges(cb: OnStateChangesCallback) {
        stateListeners.add(cb);
    }

    subscribeStateChanges(async (newState, error) => {
        if (newState !== 'WORKING') {
            return;
        }
        const worker = getWorker();
        for (const [fnName, fn] of mainThreadFunctions.entries()) {
            await worker.registerMainThreadFunction(
                fnName,
                Comlink.proxy(async (args: TransferObject<any[]>) => {
                    log.debug(`Remote called main thread function ${fnName}.`);
                    return Comlink.transfer(
                        ...toTransfer(await fn(...args.data))
                    );
                })
            );
        }
        log.debug('Ready!')
    });

    async function registerMainThreadFunction(fnName: string, fn: MainThreadCallback) {
        mainThreadFunctions.set(fnName, fn);
    }

    async function setup() {
        if (isSettingUp || state == 'WORKING')
            return;
        isSettingUp = true;

        const worker = getWorker();
        await worker.subscribeStateChanges(
            Comlink.proxy((newState, error) => {
                notifyState(newState, error);
            })
        );
        try {
            await worker.setup();
            isSettingUp = false;
        } catch (err) {
            const msg = 'Worker setup failed.';
            log.error(msg, err);
            isSettingUp = false;
            terminate();
        }
    };

    function terminate() {
        if (worker) {
            worker[Comlink.releaseProxy]();
            worker = null;
        }
        if (rawWorker) {
            rawWorker.terminate();
            rawWorker = null;
        }
        if (id !== undefined) {
            ENVIRONMENT_STORE.delete(id);
        }
        isSettingUp = false;
    }

    async function runCodeOnWorker(
        script: string,
        options?: {
            globals?: Record<string, any>,
            printRepr?: boolean,
        }
    ) {
        const worker = getWorker();
        const transferOptions = Comlink.transfer(...toTransfer(options));
        const { data } = await worker.runCodeOnWorker(script, transferOptions);
        return data;
    }

    async function callWorkerFunction(
        functionName: string,
        args: any[] = [],
        kwargs?: Record<string, any>,
        moduleName?: string,
    ) {
        const worker = getWorker();
        const { data } = await worker.callWorkerFunction(
            functionName,
            Comlink.transfer(...toTransfer(args)),
            Comlink.transfer(...toTransfer(kwargs)),
            moduleName
        );
        return data;
    }

    function configureStdout(callback: StdoutCallback) {
        const worker = getWorker();
        worker.configureStdout(Comlink.proxy(callback));
    }

    function configureStderr(callback: StderrCallback) {
        const worker = getWorker();
        worker.configureStderr(Comlink.proxy(callback));
    }

    const env = {
        get state() { return state },
        setup,
        subscribeStateChanges,
        registerMainThreadFunction,
        terminate,
        runCodeOnWorker,
        callWorkerFunction,
        configureStdout,
        configureStderr
    }
    if (id !== undefined) {
        ENVIRONMENT_STORE.set(id, env);
    }
    return env;
}


export function usePythonEnvironment(existingPython: IPythonEnvironment): IPythonEnvironment {

    const pythonRef = useRef<IPythonEnvironment | null>(existingPython);
    if (pythonRef.current === null) {
        pythonRef.current = PythonEnvironment();
    }

    const python = pythonRef.current;

    useEffect(() => {
        python.setup();
        return () => {
            python.terminate();
        };
    }, []);

    return python;
}
