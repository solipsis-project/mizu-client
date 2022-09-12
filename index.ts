#!/usr/bin/env node

import * as PublishCommand from './cli/publish/index.js'
import * as QueryCommand from './cli/query/index.js'
import * as ViewCommand from './cli/view/index.js'
import * as Logger from './logger.js'
import { baseYargsInjector, YargsFluentInjector } from './cli/yargs.js'
import { publishCommand } from './publish.js';
import { queryCommand } from './query.js';
import { viewCommand } from './view.js';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const CONFIG_KEY = "config";
const DEFAULT_CONFIG_LOCATION = (() => {
    const homedir = os.homedir();
    return path.join(homedir, ".mizurc");
})();

async function main() {
    Logger.redirectLoggingFromDependencies();
    const argsWithoutConfig = await yargs()
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









