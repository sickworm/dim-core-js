import * as mkm from 'dim-mkm-js'
import * as dkd from 'dim-dkd-js'
import { Transceiver, TransceiverDelegate } from '../src/core/transceiver'
import { Content } from '../src/protocols/contents'
import { Station } from '../src/network/station'
import { Barrack } from '../src/core/barrack';

class EmptyStation implements Station, TransceiverDelegate {
    identifier = mkm.ID.fromString("gsp-s001@x5Zh9ixt8ECr59XLye1y5WWfaX4fcoaaSC");
    host = "127.0.0.1"
    port = 9394
    publicKey = mkm.RsaPublicKey.fromPem('-----BEGIN PUBLIC KEY-----' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCaLj4hou1yDaa+c3EYT5iOPI4O' +
    'ks0aGXL8PLyaMZ6S62RmT6bOxNh6Q5fl0SozzheSMBkDaQl+y8Zeia+OW12T9dkg' +
    'VKOYBIrJ6rqWPqNVj2GAWOybUtZSyDcFgeuKpD3/QX2xLcWOfzrg0aYCkYNQUyAv' +
    'hr9I6B91DROWYQ9cEwIDAQAB' +
    '-----END PUBLIC KEY-----')

    async sendPackage(data: Buffer): Promise<void> {
    }

    async uploadFileData(data: Buffer, iMsg: dkd.InstantMessage): Promise<string> {
        return ""
    }
    
    async downloadFileData(url: string, iMsg: dkd.InstantMessage): Promise<Buffer> {
        return Buffer.alloc(0)
    }

    didReceivePackage(data: Buffer, server: Station): void {

    }

    didSendPackage(data: Buffer, server: Station): void {

    }

    didFailToSendPackage(error: Error, data: Buffer, server: Station): void {

    }
}

describe('core.ts', () => {
    const time = new Date().getTime()
    const transceiver = new Transceiver(new EmptyStation())


    ;(function initTestData() {
        // Hulk
        let hulkId = mkm.ID.fromString('hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj')
        let hulkName = 'Hulk'
        let hulkPk = mkm.RsaPublicKey.fromPem(`
            -----BEGIN PUBLIC KEY-----
            MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwfr21CuPFFPa45YJ6IUKMDBPt
            ybU29oSz6rWrVTlt+uPxChatPz0nZ2VRPVdmavqW1+3Y95wkuKVp2H+NBCx/MLg5
            tE3OI0O9L+C4AHHctyRk51lBogrGPtGfJDc0ZJtxSYnefdhS+68s37yMwfW44PFN
            iapcglQMlGBJyr+JQwIDAQAB
            -----END PUBLIC KEY-----
            `)
        let hulkSk = mkm.RsaPrivateKey.fromPem(`
            -----BEGIN RSA PRIVATE KEY-----
            MIICXQIBAAKBgQCwfr21CuPFFPa45YJ6IUKMDBPtybU29oSz6rWrVTlt+uPxChat
            Pz0nZ2VRPVdmavqW1+3Y95wkuKVp2H+NBCx/MLg5tE3OI0O9L+C4AHHctyRk51lB
            ogrGPtGfJDc0ZJtxSYnefdhS+68s37yMwfW44PFNiapcglQMlGBJyr+JQwIDAQAB
            AoGAVc0HhJ/KouDSIIjSqXTJ2TN17L+GbTXixWRw9N31kVXKwj9ZTtfTbviA9MGR
            X6TaNcK7SiL1sZRiNdaeC3vf9RaUe3lV3aR/YhxuZ5bTQNHPYqJnbbwsQkp4IOwS
            WqOMCfsQtP8O+2DPjC8Jx7PPtOYZ0sC5esMyDUj/EDv+HUECQQDXsPlTb8BAlwWh
            miAUF8ieVENR0+0EWWU5HV+dp6Mz5gf47hCO9yzZ76GyBM71IEQFdtyZRiXlV9CB
            OLvdlbqLAkEA0XqONVaW+nNTNtlhJVB4qAeqpj/foJoGbZhjGorBpJ5KPfpD5BzQ
            gsoT6ocv4vOIzVjAPdk1lE0ACzaFpEgbKQJBAKDLjUO3ZrKAI7GSreFszaHDHaCu
            Bd8dKcoHbNWiOJejIERibbO27xfVfkyxKvwwvqT4NIKLegrciVMcUWliivsCQQCi
            A1Z/XEQS2iUO89tVn8JhuuQ6Boav0NCN7OEhQxX3etFS0/+0KrD9psr2ha38qnww
            zaaJbzgoRdF12qpL39TZAkBPv2lXFNsn0/Jq3cUemof+5sm53KvtuLqxmZfZMAuT
            SIbB+8i05JUVIc+mcYqTqGp4FDfz6snzt7sMBQdx6BZY
            -----END RSA PRIVATE KEY-----
            `)

        let hulkMeta: mkm.Meta = new mkm.Meta({
            version: 0x01,
            seed: 'hulk',
            publicKey: hulkPk,
            fingerprint:
                'jIPGWpWSbR/DQH6ol3t9DSFkYroVHQDvtbJErmFztMUP2DgRrRSNWuoKY5Y26qL3' +
                '8wfXJQXjYiWqNWKQmQe/gK8M8NkU7lRwm+2nh9wSBYV6Q4WXsCboKbnM0+HVn9Vd' +
                'fp21hMMGrxTX1pBPRbi0567ZjNQC8ffdW2WvQSoec2I='}) // FIXME fingerprint is wrong

        let hulkUnsignedProfile: mkm.UnsignedProfile = {
            identifier: hulkId,
            name: hulkName,
            key: hulkPk
        }
        let hulkSignature = hulkSk.sign(Buffer.from(JSON.stringify(hulkUnsignedProfile), 'utf-8')).toString('base64')
        let hulkProfile: mkm.Profile = Object.assign(hulkUnsignedProfile, { signature: hulkSignature })

        let hulk: mkm.LocalUser = {
            identifier: hulkId,
            publicKey: hulkPk,
            privateKey: hulkSk
        }

        // //
        // //  Monkey King
        // //

        let mokiId = mkm.ID.fromString('moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk')
        let mokiName = 'Monkey King'
        let mokiPk = mkm.RsaPublicKey.fromPem(`
            -----BEGIN PUBLIC KEY-----
            MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0DnIMYYVdF4hxCymHRufO07qd
            utakN2oQBj7on2b8R106vhoLpRMl4qL8K1Y6c+6yl5/teh4LKSx6aeWoL9FrEp+p
            NjJ0BpOURV7opWxa/wtaxF9l+7l5VFwzKbK4ihZ3aAdZc/T9xPBZDOcnBvOIXo3B
            wfkecsw2uCmxnjnNLQIDAQAB
            -----END PUBLIC KEY-----
            `)

        let mokiSk = mkm.RsaPrivateKey.fromPem(`
            -----BEGIN RSA PRIVATE KEY-----
            MIICXQIBAAKBgQC0DnIMYYVdF4hxCymHRufO07qdutakN2oQBj7on2b8R106vhoL
            pRMl4qL8K1Y6c+6yl5/teh4LKSx6aeWoL9FrEp+pNjJ0BpOURV7opWxa/wtaxF9l
            +7l5VFwzKbK4ihZ3aAdZc/T9xPBZDOcnBvOIXo3Bwfkecsw2uCmxnjnNLQIDAQAB
            AoGADi5wFaENsbgTh0HHjs/LHKto8JjhZHQ33pS7WjOJ1zdgtKp53y5sfGimCSH5
            q+drJrZSApCCcsMWrXqPO8iuX/QPak72yzTuq9MEn4tusO/5w8/g/csq+RUhlLHL
            dOrPfVciMBXgouT8BB6UMa0e/g8K/7JBV8v1v59ZUccSSwkCQQD67yI6uSlgy1/N
            WqMENpGc9tDDoZPR2zjfrXquJaUcih2dDzEbhbzHxjoScGaVcTOx/Aiu00dAutoN
            +Jpovpq1AkEAt7EBRCarVdo4YKKNnW3cZQ7u0taPgvc/eJrXaWES9+MpC/NZLnQN
            F/NZlU9/H2607/d+Xaac6wtxkIQ7O61bmQJBAOUTMThSmIeYoZiiSXcrKbsVRneR
            JZTKgB0SDZC1JQnsvCQJHld1u2TUfWcf3UZH1V2CK5sNnVpmOXHPpYZBmpECQBp1
            hJkseMGFDVneEEf86yIjZIM6JLHYq2vT4fNr6C+MqPzvsIjgboJkqyK2sLj2WVm3
            bJxQw4mXvGP0qBOQhQECQQCOepIyFl/a/KmjVZ5dvmU2lcHXkqrvjcAbpyO1Dw6p
            2OFCBTTQf3QRmCoys5/dyBGLDhRzV5Obtg6Fll/caLXs
            -----END RSA PRIVATE KEY-----
            `)

        let mokiMeta: mkm.Meta = new mkm.Meta({
            version: 0x01,
            seed: 'moki',
            publicKey: mokiPk,
            fingerprint:
                'ld68TnzYqzFQMxeJ6N+aZa2jRf9d4zVx4BUiBlmur67ne8YZF08plhCiIhfyYDIw' +
                'wW7KLaAHvK8gJbp0pPIzLR4bhzu6zRpDLzUQsq6bXgMp+WAiZtFm6IHWNUwUEYcr' +
                '3iSvTn5L1HunRt7kBglEjv8RKtbNcK0t1Xto375kMlo='})

        let mokiUnsignedProfile: mkm.UnsignedProfile = {
            identifier: mokiId,
            name: mokiName,
            key: mokiPk
        }
        let mokiSignature = hulkSk.sign(Buffer.from(JSON.stringify(hulkUnsignedProfile), 'utf-8')).toString('base64')
        let mokiProfile: mkm.Profile = Object.assign(hulkUnsignedProfile, { signature: mokiSignature })

        let moki: mkm.LocalUser = {
            identifier: mokiId,
            publicKey: mokiPk,
            privateKey: mokiSk
        }

        Barrack.getInstance().addLocalUser(hulk)
        Barrack.getInstance().addProfile(hulkProfile, hulk.identifier)
        Barrack.getInstance().addMeta(hulkMeta, hulk.identifier)

        Barrack.getInstance().addLocalUser(moki)
        Barrack.getInstance().addProfile(mokiProfile, moki.identifier)
        Barrack.getInstance().addMeta(mokiMeta, moki.identifier)
    })()

    test('transceiver', async () => {
        let sender = "moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk"
        let receiver = "hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj"

        let content = Content.text("hello")
        let iMsg: dkd.InstantMessage = { content, sender, receiver, time }
        console.log(`transceiver iMsg:${JSON.stringify(iMsg)}`)
        let rMsg: dkd.ReliableMessage = transceiver.encryptAndSignMessage(iMsg);
        console.log(`transceiver rMsg:${JSON.stringify(rMsg)}`)
        let iMsg2: dkd.InstantMessage = transceiver.verifyAndDecryptMessage(rMsg);
        console.log(`transceiver iMsg2:${JSON.stringify(iMsg2)}`)

        await transceiver.sendMessage(iMsg, true);
        console.log("send message finished");
    })
})