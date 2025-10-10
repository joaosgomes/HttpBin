// Maximum number of bytes to generate for bytes and range endpoints.
export const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Sleep utility function
 * @param {number} ms - milliseconds to sleep
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random bytes with a seed
 * @param {number} length - number of bytes to generate
 * @param {number} seed - seed for random generation
 * @returns {Uint8Array}
 */
export function generateBytesWithSeed(length, seed) {
    const result = new Uint8Array(length);
    let s = seed;
    for (let i = 0; i < length; i++) {
        s = (s * 16807) % 2147483647;
        result[i] = s % 256;
    }
    return result;
}

/**
 * Decode base64 image to binary
 * @param {string} base64String - base64 encoded string
 * @returns {Uint8Array}
 */
export function decodeBase64Image(base64String) {
    const binary = atob(base64String);
    const uint8Array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
    }
    return uint8Array;
}
