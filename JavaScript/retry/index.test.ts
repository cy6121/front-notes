import { retry } from './index';

test('retry get fail test: ', () => {
    const work = () => {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => reject('error'), 100);
        });
    };
    expect(retry(work, 100, 3)).rejects.toBe('error');
});

test('retry get success test: ', () => {
    const work = () => {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => resolve('success'), 100);
        });
    };
    expect(retry(work, 100, 3)).resolves.toBe('success');

    let count = 2;
    const work2 = () => {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                if (count--) {
                    reject('error');
                } else {
                    resolve('success2');
                }
            }, 100);
        });
    };
    expect(retry(work2, 100, 3)).resolves.toBe('success2');
});
