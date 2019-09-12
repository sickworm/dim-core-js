import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'
import { Command, HistoryCommand } from './commands'

// TODO write a convert tools to convert between mkm.ID and string
interface GroupCommand extends Command {
    group: string
}

interface JoinCommand extends GroupCommand {
}

interface QuitCommand extends GroupCommand {
}

interface QueryCommand extends GroupCommand {
}

interface InviteCommand extends GroupCommand {
    members: string[]
}

// kick command
interface ExpelCommand extends GroupCommand {
    members: string[]
}

interface ResetCommand extends GroupCommand {
    members: string[]
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

    export function join(group: string): JoinCommand {
        return create({
            group: group,
            command: Type.JOIN
        })
    }

    export function quit(group: string): QuitCommand {
        return create({
            group: group,
            command: Type.QUIT
        })
    }

    export function query(group: string): QueryCommand {
        return create({
            group: group,
            command: Type.QUERY
        })
    }
    export function invite(group: string, members: string[]): InviteCommand {
        return create({
            group: group,
            command: Type.INVITE,
            members: members
        })
    }

    export function expel(group: string, members: string[]): ExpelCommand {
        return create({
            group: group,
            command: Type.EXPEL,
            members: members
        })
    }

    export function reset(group: string, members: string[]): ResetCommand {
        return create({
            group: group,
            command: Type.RESET,
            members: members
        })
    }

    function create(object: any) {
        return Object.assign({
            type: dkd.MessageType.Command,
            sn: mkm.Crypto.randomInt(),
        }, object)
    }
}
export { GroupCommand, JoinCommand, QuitCommand, QueryCommand, InviteCommand, ExpelCommand, ResetCommand }