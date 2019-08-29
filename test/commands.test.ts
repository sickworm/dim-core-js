import * as mkm from 'dim-mkm-js'
import { GroupCommand } from '../src/protocols/groups'

describe('commands.ts', () => {

    test('JoinCommand', () => {
        let groupId: mkm.ID = mkm.ID.fromString('Group-1280719982@7oMeWadRw4qat2sL4mTdcQSDAqZSo7LH5G')
        let joinCommand = GroupCommand.join(groupId)
        console.log(`joinCommand ${joinCommand}`)
        expect(joinCommand.command).toEqual(GroupCommand.Type.JOIN)
    })
})