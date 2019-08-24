import 'mocha'
import * as expect from 'expect'

describe('message.ts', () => {
  const time = new Date().getTime()

  test('new Envelope', () => {
    const envelope = {
      sender: 'alice',
      receiver: 'bob',
      time: time
    }
    expect(envelope.sender).toBe('alice')
    expect(envelope.receiver).toBe('bob')
    expect(envelope.time).toBe(time)
  })
})