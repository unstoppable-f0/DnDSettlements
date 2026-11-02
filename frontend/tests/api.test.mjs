import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { request, requestList, ApiError } from '../src/api/client.ts'
import { loadSettlement, settlementsApi } from '../src/api/settlements.ts'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
const json = (data, status = 200) => new Response(JSON.stringify(data), { status })

test('HTTP failures remain failures except explicitly empty collections', async () => {
  globalThis.fetch = async () => json({ detail: 'missing' }, 404)
  await assert.rejects(request('/settlements/1'), error => error instanceof ApiError && error.status === 404)
  await assert.rejects(requestList('/anything'))
  assert.deepEqual(await requestList('/events/unresolved/1', undefined, true), [])
  globalThis.fetch = async () => json({}, 500)
  await assert.rejects(requestList('/events/unresolved/1', undefined, true))
})

test('malformed lists and network failures are not reported as empty', async () => {
  globalThis.fetch = async () => json({ detail: 'not a list' })
  await assert.rejects(requestList('/events/unresolved/1', undefined, true))
  globalThis.fetch = async () => { throw new TypeError('Network failure') }
  await assert.rejects(requestList('/events/unresolved/1', undefined, true), /Network failure/)
})

test('settlement snapshot joins history by event id and forwards cancellation', async () => {
  const signal = new AbortController().signal
  const responses = {
    '/api/settlements/7': { id: 7, name: 'Town' },
    '/api/assets/7': { coffers: 42 },
    '/api/buildings/settlements/7': [],
    '/api/events/unresolved/7': [],
    '/api/events/resolved/7': [{ id: 2 }, { id: 3 }, { id: 4 }],
    '/api/event_resolutions/many_chosen/?event_ids=2&event_ids=3&event_ids=4': [{ event_id: 3, id: 30 }, { event_id: 2, id: 20 }],
  }
  globalThis.fetch = async (url, options) => {
    assert.equal(options.signal, signal)
    assert.ok(url in responses, url)
    return json(responses[url])
  }
  const result = await loadSettlement('7', signal)
  assert.equal(result.assets.coffers, 42)
  assert.deepEqual(result.history.map(item => item.resolution?.id), [20, 30, undefined])
})

test('empty history does not request chosen resolutions', async () => {
  globalThis.fetch = async () => { assert.fail('Unexpected request') }
  assert.deepEqual(await settlementsApi.chosenResolutions([]), [])
})

test('mutations use backend methods, query parameters and JSON contracts', async () => {
  const calls = []
  globalThis.fetch = async (url, options) => { calls.push([url, options]); return json({ id: 1 }) }
  await settlementsApi.updateCoffers('7', 'donation', 10)
  await settlementsApi.updateCoffers('7', 'withdrawal', 5)
  await settlementsApi.build(2)
  await settlementsApi.decide(3)
  const data = { event_id: 4, name: 'Resolution', description: '', income: 0, coffers: 1, resources: 0, defence: 0 }
  await settlementsApi.createResolution(data)
  assert.deepEqual(calls.slice(0, 4).map(([url, options]) => [url, options.method]), [
    ['/api/assets/coffers_donation/7?donated_gold=10', 'PATCH'],
    ['/api/assets/coffers_withdrawal/7?withdrawn_gold=5', 'PATCH'],
    ['/api/buildings/build/2', 'PATCH'], ['/api/event_resolutions/decide/3', 'PATCH'],
  ])
  assert.equal(calls[4][1].method, 'POST')
  assert.equal(calls[4][1].headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(calls[4][1].body), data)
})
