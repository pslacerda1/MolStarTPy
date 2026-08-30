import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { loadPyodide, PyodideAPI } from 'pyodide';


export interface PythonEnvironmentInterface {
    pyodide: PyodideAPI | null;
    error: string;
}

const PythonEnvironmetContext = createContext<PythonEnvironmentInterface>({
    pyodide: null,
    error: '',
});


let pyodideInstance: PyodideAPI;

export const getPyodide = () => {
    return pyodideInstance;
};

export const usePythonEnvironment = () => useContext<PythonEnvironmentInterface>(
    PythonEnvironmetContext
);

export const PythonEnvironmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pyodide, setPyodide] = useState<PyodideAPI | null>(null);
    const [error, setError] = useState<string>('');

    const wheels: string[] = [
        'public/xdrugpy_xhf-1.0.0-cp314-cp314-pyemscripten_2026_0_wasm32.whl',
        'public/tmtools-0.3.0-cp314-cp314-pyemscripten_2026_0_wasm32.whl',
        'scipy',
    ];

    useEffect(() => {
        async function initPyodineEnvironment () {
            try {
                console.debug('Initializing Pyodide...');
                const instance = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v314.0.6/full/'
                });
                await instance.loadPackage("micropip");
                const micropip = await instance.pyimport('micropip');
                await micropip.install(wheels);

                console.log('Load Python modules at component level.')
                const modulesRoot = '/python-environment';
                if (!instance.FS.analyzePath(modulesRoot).exists) {
                    instance.FS.mkdir(modulesRoot);
                }
                const modules = import.meta.glob('/src/components/*/*.py', {
                    query: '?raw',
                    eager: true,
                });
                Object.entries(modules).forEach(([filePath, rawContent]) => {
                    const fileComponents = filePath.split('/');
                    const fileDir = fileComponents[3];
                    const moduleDir = `${modulesRoot}/${fileDir}`;

                    const sourceCode = rawContent.default;

                    if (!instance.FS.analyzePath(moduleDir).exists) {
                        instance.FS.mkdir(moduleDir);
                    }
                    let fileName = fileComponents[fileComponents.length - 1];
                    if (fileName == "index.py") {
                        fileName = "__init__.py"
                    }
                    instance.FS.writeFile(`${moduleDir}/${fileName}`, sourceCode);
                });

                (globalThis as any).mstp = GLOBAL_PYTHON_FUNCTIONS;

                await instance.runPythonAsync(`
                    import sys
                    sys.path.insert(0, "${modulesRoot}")
                    import PythonEnvironment
                    del sys, PythonEnvironment
                    from js.mstp import *
                `);
                console.debug('Pyodide ready!');
                setPyodide(instance);
                pyodideInstance = instance;
            } catch (err: any) {
                const msg = `Initialization of Pyodide failed.`
                console.error(msg, err);
                setError(msg);
            }
        };
        initPyodineEnvironment();
    }, []);

    return (
        <PythonEnvironmetContext.Provider value={{ pyodide, error }}>
            {children}
        </PythonEnvironmetContext.Provider>
    );
};


const GLOBAL_PYTHON_FUNCTIONS: Record<string, Function> = {};


// Cabrunco!
export type PythonCallable = Function;
export function registerFunctionIntoPython<T extends PythonCallable>(cmd: T, name?: string): T {
    const fnName = name || cmd.name;
    if (!fnName)
        throw new Error("A named function or an explicit name is required");

    if (Object.keys(GLOBAL_PYTHON_FUNCTIONS).findIndex((name) => name == fnName) > -1)
        throw new Error("Could not register with the same name.");

    async function impl(...args: Parameters<T>): Promise<ReturnType<T>> {
        try {
            return await cmd(...args);
        } catch (err: any) {
            console.error(`Unexpected failure at py/js frontier in ${fnName}`, err);
            throw err;
        }
    }

    function wraps<T extends (...args: any[]) => any>(target: T, wrapper: (...args: any[]) => any): T {
        Object.defineProperty(wrapper, 'name', { value: target.name, configurable: true });
        return Object.assign(wrapper, target) as T;
    }
    const wrapped = wraps(cmd, impl);

    GLOBAL_PYTHON_FUNCTIONS[cmd.name] = wrapped;
    return cmd;
}
