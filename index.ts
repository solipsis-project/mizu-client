import * as PublishCommand from './cli/publish'
import * as QueryCommand from './cli/query'
import * as ViewCommand from './cli/view'
import { baseYargsInjector } from './cli/yargs'
import { publishCommand } from './publish';
import { queryCommand } from './query';
import { viewCommand } from './view';

const args = baseYargsInjector
    .addCommand(PublishCommand, publishCommand)
    .addCommand(QueryCommand, queryCommand)
    .addCommand(ViewCommand, viewCommand)
    .yargsObject.strict().parse()