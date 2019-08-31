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
        let hulkPk = mkm.RsaPublicKey.fromPem('-----BEGIN PUBLIC KEY-----' +
            'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCv1PG80ekJHao6O4M7HvDGPBal' +
            'bnB8H//6SC1CHs2hfoQekMwsebYi3ylTKu5+ci4fV/uoy9QYwvbYEXPpFPzSnHNz' +
            'lzwTfzaTjeXYOw3Le6T4evSRdqH97AkVMDAxsiemMxzn+552CY0SqriE8ecFAdzg' +
            'lmDnnI21q/6lEG0ufQIDAQAB' +
            '-----END PUBLIC KEY-----')
        let hulkSk = mkm.RsaPrivateKey.fromPem(
            '-----BEGIN PRIVATE KEY-----' +
            'MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAK/U8bzR6Qkdqjo7' +
            'gzse8MY8FqVucHwf//pILUIezaF+hB6QzCx5tiLfKVMq7n5yLh9X+6jL1BjC9tgR' +
            'c+kU/NKcc3OXPBN/NpON5dg7Dct7pPh69JF2of3sCRUwMDGyJ6YzHOf7nnYJjRKq' +
            'uITx5wUB3OCWYOecjbWr/qUQbS59AgMBAAECgYAbXFF5hlhy2LDietxC2N+ymSsU' +
            '9wh96CTW92BDh7OLy7oXX4TF7vKOnpc5n9aYyn+u1OwOKhmI+N2cZarZvDBS+3i6' +
            'Kphd9arVOpNoLJbQPpx8dhnw5+MO42D3AqOD3S3ioOtDXFgdVhsEl9wp1l09MqGH' +
            'gGR+DNCuTpn2A9lOwQJBAN35PfIHk2/CIyQEV8ALAJsbgCOJP2c5NHSk8MqFL3/f' +
            'TVRqoAx57Un6vZwldzaSt6j5ynhEnTsf14LS6DDcBKkCQQDKyP3iMR9c5xZCM8VD' +
            'Qe48i82Gs/5SLyGRGa1RkouxaQk5HrgA7cR846X3gstlgBe7BXlgbsSMiadanfDX' +
            'Wau1AkB1BwrZp5Tbvwa33nJFFYfkPsN3+Mwsp8Q4Gx24KC+6wwgKEY0ABuhLsJ52' +
            'zGnlo8SgmdFdRw9+NHNyza8M03LBAkBv66zMSYZg1R4g3cfzDhF6E0MVJISqQV8K' +
            'YZyaGALHoQw5HW46/P/kWhTA3cx6sc7nJudNxPTwCA144xEJGnG9AkAKFCcSW7QW' +
            'e6r2yG4bp6epLHoPcouR81Ynnqt/eYTjDHGknMF9ADqplJKBNLl+a3ti6+cTBw5S' +
            'NJFpuyff1DMQ' +
            '-----END PRIVATE KEY-----')

        let hulkMeta: mkm.Meta = new mkm.Meta({
            version: 0x01,
            seed: 'hulk',
            publicKey: hulkPk,
            fingerprint:
                'jIPGWpWSbR/DQH6ol3t9DSFkYroVHQDvtbJErmFztMUP2DgRrRSNWuoKY5Y26qL3' +
                '8wfXJQXjYiWqNWKQmQe/gK8M8NkU7lRwm+2nh9wSBYV6Q4WXsCboKbnM0+HVn9Vd' +
                'fp21hMMGrxTX1pBPRbi0567ZjNQC8ffdW2WvQSoec2I='})

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
        let mokiPk = mkm.RsaPublicKey.fromPem(
            '-----BEGIN PUBLIC KEY-----' +
            'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDSMBFoVfbM1A/jue+VcGLv2Bm' +
            'GldQ9x6I/ZqU2pgdW+oKBLOuTOSKQehDSnPknL1v7p5qMNEvNUK9uDcXpem6gBYl' +
            'wlSVMG9Y5FOYad2rbc5EcrgOd/Ep0dGWLtF1tPsBft/mjVxFDBe6Z+oIDlYgPP1i' +
            'sHibjMs12iziDgOkuQIDAQAB' +
            '-----END PUBLIC KEY-----')

        let mokiSk = mkm.RsaPrivateKey.fromPem(
            '-----BEGIN PRIVATE KEY-----' +
            'MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAMNIwEWhV9szUD+O' +
            '575VwYu/YGYaV1D3Hoj9mpTamB1b6goEs65M5IpB6ENKc+ScvW/unmow0S81Qr24' +
            'Nxel6bqAFiXCVJUwb1jkU5hp3attzkRyuA538SnR0ZYu0XW0+wF+3+aNXEUMF7pn' +
            '6ggOViA8/WKweJuMyzXaLOIOA6S5AgMBAAECgYEAjr3+zObCcVdwsQSkIFxOvPeG' +
            'Xxuh92yqxTeaZnPh/JPS3r/RFvbdlrHWNFmXnON1FPw2jyhfv0IPJt4gZwi/bmvy' +
            'BlbXkbkrjX1sm92uTgGwAkQuWqhP7DedqShtTo0AP/UsIRpxmcT0dgBcYqP+3Y7E' +
            'duT+IUt7+gloVCzlugECQQDt5VBT9et++rCvnp/96Bx/hE79WvMZvmNcuBfbbsrm' +
            'EHQIthamAlcJSlEipo10Q3hwd5ViTpqyrIigb9Mi0qk9AkEA0iVHRokywLClQDIv' +
            'QrEXpv0noIpCaGb+ggsf5XpQi809qDRLrcrbw3QAKPLq89gphYsSry9FYAjCD1DS' +
            'nDfJLQJBAMnfRtwImi8lkltk8wVmOxCmeNUboaEd43lhqrUFfl3eZmiiA/QZljwG' +
            '+XS6+txHCOP/Rh+m7jVinYnveq5ZL00CQQDE8pUbQUgkmSk2whHS8kAVi9rQteNJ' +
            'D4XlgOGS4xCMBX2Mn/5xUdanFpdzyT5z7Bn2A4IuVyIwv+SIEBpiuFG9AkEAvZyT' +
            'r2I0Gge/2mAch8yZtIst9kd9tLBffuI7WA+550liCMPXPXRZ47i3n/km3otqphPv' +
            'lOOcUv3J5uvIrB7ZbA==' +
            '-----END PRIVATE KEY-----')

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