#!/usr/bin/env node

import * as PublishCommand from './cli/publish'
import * as QueryCommand from './cli/query'
import * as ViewCommand from './cli/view'
import * as Logger from './logger'
import { baseYargsInjector, YargsFluentInjector } from './cli/yargs'
import { publishCommand } from './publish';
import { queryCommand } from './query';
import { viewCommand } from './view';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

type YargsType = typeof yargs;

const CONFIG_KEY = "config";
const DEFAULT_CONFIG_LOCATION = (() => {
    const homedir = os.homedir();
    return path.join(homedir, ".mizurc");
})();

async function main() {
    const argsWithoutConfig = await yargs
        .option(CONFIG_KEY, {
            type: "string",
            default: DEFAULT_CONFIG_LOCATION
        })
        .help(false) // By suppressing --help here, we make sure that --help is caught by the subsequent yargs run.
        .parse();

    const configFile = argsWithoutConfig[CONFIG_KEY];

    // TODO: Gracefully handle IO errors or invalid formats. Create file if it doesn't exist.
    const configJSON = (await fs.readFile(configFile)).toString();
    const config = JSON.parse(configJSON);

    const args = baseYargsInjector(configFile, config, (yargs: YargsFluentInjector) => {
        return yargs.addCommand(PublishCommand, publishCommand)
            .addCommand(QueryCommand, queryCommand)
            .addCommand(ViewCommand, viewCommand);
    }).strict().parse(hideBin(process.argv));
}

main().catch(reason => {
    Logger.error((logger) => logger(reason));
});









