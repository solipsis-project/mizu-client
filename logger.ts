import _ from 'lodash';

export enum LogLevel {
    DEBUG,
    VERBOSE,
    INFO,
    WARN,
    ERROR
}

var minimumLogLevel: LogLevel = LogLevel.INFO;

export function setMinimumLogLevel(newMinimumLogLevel: LogLevel) {
    minimumLogLevel = newMinimumLogLevel;
}

type LogOptions = {
    separator?: string;
    terminator?: string;
}

export function debug(generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    log(LogLevel.DEBUG, generator);
}

export function verbose(generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    log(LogLevel.VERBOSE, generator);
}

export function info(generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    log(LogLevel.INFO, generator);
}

export function warn(generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    log(LogLevel.WARN, generator);
}

export function error(generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    log(LogLevel.ERROR, generator);
}

export function log(logLevel: LogLevel, generator: (logger: (...log: unknown[]) => unknown) => unknown, options: LogOptions = {}) {
    if (logLevel < minimumLogLevel) {
        return;
    }
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
