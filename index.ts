import * as PublishCommand from './cli/publish'
import { baseYargsInjector } from './cli/yargs'
import { publishCommand } from './publish';

const args = baseYargsInjector
    .addCommand(PublishCommand, publishCommand)
    .yargs.strict().parse()