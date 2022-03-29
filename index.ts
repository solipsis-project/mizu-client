import * as PublishCommand from './cli/publish'
import * as QueryCommand from './cli/query'
import { baseYargsInjector } from './cli/yargs'
import { publishCommand } from './publish';
import { queryCommand } from './query';

const args = baseYargsInjector
    .addCommand(PublishCommand, publishCommand)
    .addCommand(QueryCommand, queryCommand)
    .yargsObject.strict().parse()