import * as mkm from 'dim-mkm-js'
import { GroupCommand } from '../src/protocols/groups'

describe('commands.ts', () => {

    test('JoinCommand', () => {
        let joinCommand = GroupCommand.join('Group-1280719982@7oMeWadRw4qat2sL4mTdcQSDAqZSo7LH5G')
        console.log(`joinCommand ${JSON.stringify(joinCommand)}`)
        expect(joinCommand.command).toEqual(GroupCommand.Type.JOIN)
    })
})