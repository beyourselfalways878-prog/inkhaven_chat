/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
declare module 'maath/random/dist/maath-random.esm' {
    export function inSphere(
        _buffer: Float32Array,
        _options?: { radius?: number; center?: number[] }
    ): Float32Array;

    export function inBox(
        _buffer: Float32Array,
        _options?: { sides?: number[] }
    ): Float32Array;
}
