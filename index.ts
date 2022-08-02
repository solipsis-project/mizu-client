import * as PublishCommand from './cli/publish'
import * as QueryCommand from './cli/query'
import * as ViewCommand from './cli/view'
import { baseYargsInjector } from './cli/yargs'
import { publishCommand } from './publish';
import { queryCommand } from './query';
import { viewCommand } from './view';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import yargs from 'yargs';

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
        .parse();

    const configFile = argsWithoutConfig[CONFIG_KEY];

    // TODO: Gracefully handle IO errors or invalid formats.
    const configJSON = (await fs.readFile(configFile)).toString();
    const config = JSON.parse(configJSON);

    const args = baseYargsInjector(config)
        .addCommand(PublishCommand, publishCommand)
        .addCommand(QueryCommand, queryCommand)
        .addCommand(ViewCommand, viewCommand)
        .yargsObject.strict().parse();

}

main();









