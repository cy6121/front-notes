// Create alphabet array: ['a', 'b', 'c', ..., 'z'].
const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

function getCipherMap(alphabet: string[], shift: number) {
    return alphabet.reduce((pre, cur, index) => {
        let encryptedCharIndex = (index + shift) % alphabet.length;
        if (encryptedCharIndex < 0) {
            encryptedCharIndex += alphabet.length;
        }
        pre.set(cur, alphabet[encryptedCharIndex]);
        return pre;
    }, new Map<string, string>());
}

export function caesarCipherEncrypt(str: string, shift: number, alphabet = englishAlphabet) {
    const cipherMap = getCipherMap(alphabet, shift);
    return str.toLocaleLowerCase().split('').map(item => cipherMap.get(item) || item).join('');
}

export function caesarCipherDecrypt(str: string, shift: number, alphabet = englishAlphabet) {
    const cipherMap = getCipherMap(alphabet, -shift);
    return str.toLocaleLowerCase().split('').map(item => cipherMap.get(item) || item).join('');
}