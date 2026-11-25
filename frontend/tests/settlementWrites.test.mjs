import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import { test } from 'node:test'
import { openSettlement, runSettlementWrite } from '../src/settlement/settlementWrites.ts'

test('a second command for the same settlement is ignored while another settlement can save', async () => {
  const gate = Promise.withResolvers()
  const first = runSettlementWrite(7, () => gate.promise)
  try {
    assert.equal(await runSettlementWrite(7, () => assert.fail('Duplicate command')), false)
    assert.equal(await runSettlementWrite(8, async () => {}), true)
  } finally {
    gate.resolve()
  }
  assert.equal(await first, true)
  assert.equal(await runSettlementWrite(7, async () => {}), true)
})

for (const failed of [false, true]) {
  test(`reopening a settlement waits for a previous ${failed ? 'failed' : 'successful'} command`, async t => {
    const settlement = { id: 7, name: 'Town', campaign: 1 }
    t.mock.method(globalThis, 'fetch', async () => Response.json(settlement))
    const gate = Promise.withResolvers()
    const command = runSettlementWrite(7, () => gate.promise)
    const outcome = failed ? assert.rejects(command, /interrupted/) : command
    let opened = false
    // Route aliases resolve to the same server-side settlement ID.
    const read = openSettlement('007', new AbortController().signal).then(result => {
      opened = true
      return result
    })
    try {
      await setImmediate()
      assert.equal(opened, false)
    } finally {
      if (failed) gate.reject(new Error('interrupted'))
      else gate.resolve()
    }
    await outcome
    assert.deepEqual(await read, settlement)
    assert.equal(await runSettlementWrite(7, async () => {}), true)
  })
}
