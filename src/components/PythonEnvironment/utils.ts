import { TransferObject } from './types';


export const TRANSFER_NULL: TransferObject = {data: null};


export function maybeDestroy(obj: any) {
    if (typeof obj?.destroy === 'function' && !obj.isDestroyed?.()) {
        try {
            obj?.destroy();
        } catch {
            // maybe was already freed
        }
    }
}


export function toTransfer<T = any>(
    val: any,
    depth: number = 10
): [TransferObject<T>, Transferable[]] {

    type TypedArray =
        | Int8Array
        | Uint8Array
        | Uint8ClampedArray
        | Int16Array
        | Uint16Array
        | Int32Array
        | Uint32Array
        | Float32Array
        | Float64Array
        | BigInt64Array
        | BigUint64Array;

    const buffers: Transferable[] = [];

    function walk(currentVal: any, currentDepth: number): any {
        if (currentVal === null || currentVal === undefined || currentDepth <= 0) {
            return currentVal;
        }

        if (typeof currentVal === 'function') {
            throw new Error('Cannot serialize a function');
        }

        // 1. PyBuffer / memoryview do Pyodide
        if (typeof currentVal === 'object' && currentVal.constructor?.name === 'PyBuffer') {
            const typedArray = currentVal.toJs() as TypedArray;
            if (typeof currentVal.release === 'function') {
                currentVal.release();
            }
            buffers.push(typedArray.buffer);
            return typedArray;
        }

        // 2. TypedArray nativo (ArrayBufferView)
        if (ArrayBuffer.isView(currentVal) && !(currentVal instanceof DataView)) {
            buffers.push(currentVal.buffer);
            return currentVal;
        }

        // 3. PyProxy
        if (typeof currentVal?.toJs === 'function') {
            const jsVal = currentVal.toJs({
                create_proxies: false,
                depth: currentDepth,
                dict_converter: Object.fromEntries,
            });
            return walk(jsVal, currentDepth - 1);
        }

        // 4. Arrays / Listas
        if (Array.isArray(currentVal)) {
            return currentVal.map((v) => walk(v, currentDepth - 1));
        }

        // 5. Objetos literais / Dicionários
        if (typeof currentVal === 'object' && currentVal.constructor === Object) {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(currentVal)) {
                result[key] = walk(value, currentDepth - 1);
            }
            return result;
        }

        // Primitivos
        return currentVal;
    }

    const data = walk(val, depth);
    return [ { data }, buffers ];
}