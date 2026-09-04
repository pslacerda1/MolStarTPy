import * as Comlink from 'comlink';
import { loadPyodide, PyodideInterface } from 'pyodide';
import { PyProxy } from 'pyodide/ffi';
import {
    MainThreadCallback,
    OnStateChangesCallback,
    EnvironmentState,
    PythonCallable,
    StderrCallback,
    StdoutCallback,
    TransferObject,
} from './types';
import { Logger } from '@/utils';
import { toTransfer, maybeDestroy } from './utils.ts';


const PYTHON_MODULES = import.meta.glob('/src/components/*/*.py', {
    query: '?raw',
    eager: true,
});


let PYODIDE_INSTANCE: PyodideInterface | null = null;

export function getPyodide() {
    if (!PYODIDE_INSTANCE)
        throw new Error('Pyodide is null.');

    return PYODIDE_INSTANCE;
}

export function setPyodide(pyodide: PyodideInterface) {
    PYODIDE_INSTANCE = pyodide;
}




const log = Logger();

let CURRENT_STATE: EnvironmentState = 'DOWN';
const STATE_LISTENERS = new Set<OnStateChangesCallback>();

function setCurrentState(state: EnvironmentState, error?: string) {
    CURRENT_STATE = state;
    for (const cb of STATE_LISTENERS) {
        cb(CURRENT_STATE, error);
    }
}


const STDOUT_LISTENERS: StdoutCallback[] = [];
const STDERR_LISTENERS: StderrCallback[] = [];


const pythonWorkerApi = {

    async setup() {
        let pyodide: PyodideInterface;
        setCurrentState('INITIALIZING');
        try {
            pyodide = await newPyodide();
            setPyodide(pyodide);
            setCurrentState('WORKING');
        } catch (err) {
            const msg = `Failed to initialize.`;
            log.error(msg, err);
            setCurrentState('FAILED', msg);
        }
    },

    async subscribeStateChanges(callback: OnStateChangesCallback) {
        STATE_LISTENERS.add(callback);
    },

    async runCodeOnWorker(
        script: string,
        options?: TransferObject<{
            globals?: Record<string, any>,
            printRepr?: boolean,
        }>
    ): Promise<TransferObject> {
        const pyodide = await getPyodide();
        let pyGlobals: PyProxy;
        let rawResult: any;
        try {
            log.debug('Running code string on worker');
            const options_ = options?.data;
            const globals = options_?.globals;
            if (globals?.data) {
                pyGlobals = pyodide.toPy(globals.data);
                rawResult = await pyodide.runPythonAsync(script, {
                    globals: pyGlobals
                });
            } else {
                rawResult = await pyodide.runPythonAsync(script)
            }

            if (options_?.printRepr && rawResult !== undefined) {
                const pyRawResult = pyodide.toPy(rawResult);
                pyodide.globals.set('__rv', pyRawResult);
                await pyodide.runPythonAsync('print(__rv)');
                pyodide.globals.delete('__rv');
                maybeDestroy(pyRawResult);
            }
            return Comlink.transfer(...toTransfer(rawResult))
        } catch (err) {
            const msg = 'Failed to run source code';
            log.error(msg, err);
            throw err;
        } finally {
            //@ts-ignore
            maybeDestroy(pyGlobals);
            maybeDestroy(rawResult);
        }
    },

    async callWorkerFunction(
        fnName: string,
        args: TransferObject<any[]>,
        kwargs?: TransferObject<Record<string, any>>,
        moduleName?: string,
    ): Promise<TransferObject> {
        const pyodide = await getPyodide();

        if (!moduleName) {
            const index = fnName.lastIndexOf('.');
            if (index > -1) {
                moduleName = fnName.slice(0, index);
                fnName = fnName.slice(index + 1);
            }
        }

        let fn: PyProxy;
        let mod: PyProxy | null = null;
        let pyKwargs: PyProxy | null = null;
        let results: any;

        if (moduleName) {
            mod = pyodide.pyimport(moduleName);
            if (!mod)
                throw new Error(`Module ${moduleName} not found`);
            fn = mod[fnName];
        } else {
            fn = pyodide.globals[fnName];
        }

        if (!fn) {
            let msg = `Function ${fnName} not found`;
            if (moduleName) {
                msg += ` at ${moduleName}`;
            }
            throw new Error(msg);
        }

        try {
            if (kwargs?.data !== undefined) {
                pyKwargs = pyodide.toPy(kwargs.data);
                results = await fn.callKwargs(...args.data, pyKwargs);
            } else {
                results = await fn.call({}, ...args.data);
            }
            return Comlink.transfer(...toTransfer(results));
        } finally {
            if (moduleName) maybeDestroy(fn);
            maybeDestroy(mod);
            maybeDestroy(pyKwargs);
            maybeDestroy(results);
        }
    },

    async configureStdout(callback: (text: string) => void) {
        STDOUT_LISTENERS.push(callback);
    },

    async configureStderr(callback: (text: string) => void) {
        STDERR_LISTENERS.push(callback);
    },

    async registerMainThreadFunction(fnName: string, callback: (args: TransferObject<any[]>) => any) {
        log.debug(`Will register ${fnName} on the main thread.`);

        async function wrapper(...args: any) {
            let rawResult;
            try {
                rawResult = await callback(
                    Comlink.transfer(...toTransfer(args))
                );
                return rawResult.data;

            } catch (err) {
                log.error(`Error on main thread function ${fnName}`, err);
                throw err;
            }
        }
        const pyodide = getPyodide();
        pyodide.globals.set(fnName, wrapper);
    }
};

export type PythonWorkerApi = typeof pythonWorkerApi;
Comlink.expose(pythonWorkerApi);


async function newPyodide() {

    const url = new URL(location.toString());
    const pyodideIndexUrl = url.origin + '/pyodide'
    log.debug('pyodideIndexUrl', pyodideIndexUrl);

    const LOAD_PACKAGE_WHEELS: string[] = [
        'micropip',
        'numpy',
        'scipy',
        pyodideIndexUrl + '/tmtools-0.3.0-cp314-cp314-pyemscripten_2026_0_wasm32.whl'
    ];


    try {
        log.debug('Initializing Pyodide...');
        const pyodide = await loadPyodide({
            indexURL: pyodideIndexUrl,
            stdout: (text) => {
                for (const cb of STDOUT_LISTENERS) {
                    cb(text);
                }
            },
            stderr: (text) => {
                for (const cb of STDERR_LISTENERS) {
                    cb(text);
                }
            },
        });
        pyodide.setDebug(true);
        // log.debug('Registering Comlink');
        // pyodide.registerComlink(pythonWorkerApi);

        const load_wheels = LOAD_PACKAGE_WHEELS.map(pkg =>
            pkg.indexOf('/') > -1
                ? new URL(pkg, location.href).href
                : pkg
        );
        await pyodide.loadPackage(load_wheels, {
            messageCallback: log.debug,
            errorCallback: log.error,
            checkIntegrity: false,
        });

        const tmtools = await pyodide.pyimport('tmtools');
        const numpy = await pyodide.pyimport('numpy');

        log.debug('Load Python modules at component level.');
        const modulesRoot = '/python-environment';
        if (!pyodide.FS.analyzePath(modulesRoot).exists) {
            pyodide.FS.mkdir(modulesRoot);
        }
        Object.entries(PYTHON_MODULES).forEach(([filePath, rawContent]) => {
            const fileComponents = filePath.split('/');
            const fileDir = fileComponents[3];
            const moduleDir = `${modulesRoot}/${fileDir}`;

            // @ts-ignore
            let sourceCode: string = 'default' in rawContent ?
                rawContent.default : rawContent;

            if (!pyodide.FS.analyzePath(moduleDir).exists) {
                pyodide.FS.mkdir(moduleDir);
            }
            let fileName = fileComponents[fileComponents.length - 1];
            if (fileName == "index.py") {
                fileName = "__init__.py"
            }
            pyodide.FS.writeFile(`${moduleDir}/${fileName}`, sourceCode);
        });

        log.debug('Adding /python-environment to the PYTHONPATH');
        pyodide.runPythonAsync(`
            import sys
            sys.path.insert(0, "/python-environment")
        `);

        log.debug('Pyodide worker configuration done!');
        return pyodide;
    } catch (err: any) {
        log.error(`Initialization of Pyodide failed.`, err);
        throw err;
    }
};


/**
 * Javascript functions accessible Python globals.
 */
const WORKER_PYTHON_FUNCTIONS: Map<string, PythonCallable> = new Map();

export function intoPythonFromWorker<T extends PythonCallable>(cmd: T): T;
export function intoPythonFromWorker<T extends PythonCallable>(cmdName: string, cmd: T): T;
export function intoPythonFromWorker<T extends PythonCallable>(cmdOrName: string | T, maybeCmd?: T): T {
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

    if (WORKER_PYTHON_FUNCTIONS.has(fnName))
        throw new Error("Could not register with the same name.");

    async function impl(...args: Parameters<T>) {
        try {
            return await fn(...args);
        } catch (err: any) {
            console.error(`Unexpected failure at py/js frontier in ${fnName}`, err);
            throw err;
        }
    }

    Object.defineProperty(impl, 'name', { value: fnName });
    Object.defineProperty(impl, 'toString', {
        value: () => fn.toString(),
    });
    WORKER_PYTHON_FUNCTIONS.set(fnName, impl);
    // @ts-ignore
    return impl;
}













// ////////// UI MEU GEMINI ULÁLÁ

// // worker.ts
// class WorkerNode {
//     private pyodide!: PyodideInterface;
//     private peerPorts: Map<string, Comlink.Remote<WorkerNode>> = new Map();

//     async init() {
//         this.pyodide = await newPyodide();

//         // Expõe a ponte para o runtime Python local
//         (globalThis as any).__py_dispatcher__ = {
//             callRemote: async (peerId: string, fn: string, args: any[], kwargs: Record<string, any>) => {
//                 const peer = this.peerPorts.get(peerId);
//                 if (!peer) throw new Error(`Peer Worker ${peerId} not connected`);
//                 return await peer.executePythonFunction(fn, args, kwargs);
//             }
//         };
//     }

//     // Aceita conexão de outro Worker via MessagePort
//     connectPeer(peerId: string, port: MessagePort) {
//         const peerRemote = Comlink.wrap<WorkerNode>(port);
//         this.peerPorts.set(peerId, peerRemote);
//     }

//     async executePythonFunction(fnName: string, args: any[], kwargs?: Record<string, any>) {
//         // Executa a função Python e trata recursivamente com a unpackPyBuffers
//         // garantindo liberação imediata de memória
//     }
// }

// Comlink.expose(new WorkerNode());