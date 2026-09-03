import { StackFrame } from 'error-stack-parser';
import StackTrace from 'stacktrace-js';



export function Logger() {

    function loggerImpl(logger: any, msg: string, ...args: any[]) {
        const timestamp = new Date().toISOString();
        getCallerLocation(3).then((caller) => {
            let text = `${timestamp} [${logger.name}]`;
            text += ` ${caller.fileName}:${caller.lineNumber}`;
            text += ` (${caller.functionName}): ${msg}`;
            logger(text, ...args);
        });
    }

    return {
        debug(msg: string, ...args: any[]) {
            if (import.meta.env.DEV) {
                loggerImpl(console.debug, msg, ...args);
            }
        },
        info(msg: string, ...args: any[]) {
            loggerImpl(console.info, msg, ...args);
        },
        error(msg: string, ...args: any[]) {
            loggerImpl(console.error, msg, ...args);
        },
        warn(msg: string, ...args: any[]) {
            loggerImpl(console.warn, msg, ...args);
        }
    }
}


export interface CallerInfo {
    fileName: string;
    functionName: string;
    lineNumber: number;
}

export async function getCallerLocation(depth: number): Promise<CallerInfo> {
    const err = new Error();

    const frames = await StackTrace.fromError(err);
    const frame = frames[depth];
    return {
        fileName: frame.fileName
            ? cleanPath(frame.fileName)
            : '<unknown>',
        functionName: frame.functionName ?? '<anonymous>',
        lineNumber: frame.lineNumber ?? -1,
    };
}

/**
 * Limpa parâmetros do Vite (ex: ?t=1690000) e URLs completas
 * deixando apenas o caminho relativo do arquivo (ex: "src/worker.ts")
 */
function cleanPath(rawUrl: string): string {
    if (!rawUrl) return 'unknown';
    try {
        const parsed = new URL(rawUrl);
        const pathname = parsed.pathname;
        return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } catch {
        return rawUrl;
    }
}