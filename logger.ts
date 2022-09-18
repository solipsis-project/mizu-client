import _ from 'lodash';

export enum LogLevel {
    DEBUG,
    VERBOSE,
    INFO,
    WARN,
    ERROR
}

var minimumLogLevel: LogLevel = LogLevel.INFO;

export const consoleLog = console.log;

export function setMinimumLogLevel(newMinimumLogLevel: LogLevel) {
    minimumLogLevel = newMinimumLogLevel;
}

export function redirectLoggingFromDependencies() {
    console.log = console.error;
}

type LogOptions = {
    separator?: string;
    terminator?: string;
}

type LogGenerator = (logger: (...log: unknown[]) => unknown) => unknown;

export function debug(generator: LogGenerator, options: LogOptions = {}) {
    log(LogLevel.DEBUG, generator, options);
}

export function verbose(generator: LogGenerator, options: LogOptions = {}) {
    log(LogLevel.VERBOSE, generator, options);
}

export function info(generator: LogGenerator, options: LogOptions = {}) {
    log(LogLevel.INFO, generator, options);
}

export function warn(generator: LogGenerator, options: LogOptions = {}) {
    log(LogLevel.WARN, generator, options);
}

export function error(generator: LogGenerator, options: LogOptions = {}) {
    log(LogLevel.ERROR, generator, options);
}

export function log(logLevel: LogLevel, generator: LogGenerator , options: LogOptions = {}) {
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
