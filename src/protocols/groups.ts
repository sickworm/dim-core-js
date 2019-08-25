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

// kick command
interface ExpelCommand extends GroupCommand {
    members: mkm.ID[]
}

interface ResetCommand extends GroupCommand {
    members: mkm.ID[]
}

module GroupCommand {
    export enum Type {
        // account
        REGISTER = "register",
        SUICIDE  = "suicide",
        // group: founder/owner
        FOUND    = "found",
        ABDICATE = "abdicate",
        // group: member
        INVITE   = "invite",
        EXPEL    = "expel",
        JOIN     = "join",
        QUIT     = "quit",
        QUERY    = "query",
        RESET    = "reset",
        // group: administrator/assistant
        HIRE     = "hire",
        FIRE     = "fire",
        RESIGN   = "resign"
    }

    export function join(group: mkm.ID): JoinCommand {
        return create({
            group: group,
            command: Type.JOIN
        })
    }

    export function quit(group: mkm.ID): QuitCommand {
        return create({
            group: group,
            command: Type.QUIT
        })
    }

    export function query(group: mkm.ID): QueryCommand {
        return create({
            group: group,
            command: Type.QUERY
        })
    }
    export function invite(group: mkm.ID, members: mkm.ID[]): InviteCommand {
        return create({
            group: group,
            command: Type.INVITE,
            members: members
        })
    }

    export function expel(group: mkm.ID, members: mkm.ID[]): ExpelCommand {
        return create({
            group: group,
            command: Type.EXPEL,
            members: members
        })
    }

    export function reset(group: mkm.ID, members: mkm.ID[]): ResetCommand {
        return create({
            group: group,
            command: Type.RESET,
            members: members
        })
    }

    function create(object: any) {
        return Object.assign({
            type: dkd.MessageType.Command,
            serialNumber: 123,
        }, object)
    }
}
export { GroupCommand, JoinCommand, QuitCommand, QueryCommand, InviteCommand, ExpelCommand, ResetCommand }