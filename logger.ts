import _ from 'lodash';

type LogOptions = {
    separator?: string;
    terminator?: string;
}

export function debug(generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    const separator = options.separator || ' ';
    const terminator = options.terminator || '\n';

    function print(...args: unknown[]) {
        for (const arg of args) {
            const argString = _.isString(arg) ? arg : JSON.stringify(arg, null, 2);
            process.stderr.write(argString);
            process.stderr.write(separator);
        }
        process.stderr.write(terminator);
    }
    generator(print);
}
