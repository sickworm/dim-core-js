import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'
import { Command, HistoryCommand } from './commands'

interface GroupCommand extends Command {
    group: mkm.ID
}

interface JoinCommand extends GroupCommand {

}

interface QuitCommand extends GroupCommand {

}

interface QueryCommand extends GroupCommand {

}

interface InviteCommand extends GroupCommand {
    members: mkm.ID[]
}

// kick
interface ExpelCommand extends GroupCommand {
    members: mkm.ID[]
}

interface ResetCommand extends GroupCommand {
    members: mkm.ID[]
}

export { JoinCommand, QuitCommand, QueryCommand, InviteCommand, ExpelCommand, ResetCommand }