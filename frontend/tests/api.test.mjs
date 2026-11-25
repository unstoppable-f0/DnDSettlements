import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { request, requestList, ApiError } from '../src/api/client.ts'
import { listCampaigns, listCampaignSettlements } from '../src/api/campaigns.ts'
import { createResolution, decideResolution, listActiveEvents, listResolutions, loadEventHistory } from '../src/api/events.ts'
import { buildProject, getAssets, getSettlement, listBuildings, updateCoffers } from '../src/api/settlements.ts'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
const json = (data, status = 200) => new Response(JSON.stringify(data), { status })

test('collection endpoints follow their individual FastAPI 404 contracts', async () => {
  const signal = new AbortController().signal
  globalThis.fetch = async () => json({ detail: 'missing' }, 404)
  await assert.rejects(request('/settlements/1'), error => error instanceof ApiError && error.status === 404)
  await assert.rejects(requestList('/anything'))
  await assert.rejects(listCampaignSettlements(1, signal))
  await assert.rejects(listBuildings(1, signal))
  assert.deepEqual(await listCampaigns(signal), [])
  assert.deepEqual(await listActiveEvents(1, signal), [])
  assert.deepEqual(await listResolutions(2, signal), [])
  globalThis.fetch = async () => json({}, 500)
  await assert.rejects(listActiveEvents(1, signal))
})

test('malformed lists and network failures are not reported as empty', async () => {
  globalThis.fetch = async () => json({ detail: 'not a list' })
  await assert.rejects(requestList('/events/unresolved/1', { emptyOn404: true }))
  globalThis.fetch = async () => { throw new TypeError('Network failure') }
  await assert.rejects(requestList('/events/unresolved/1', { emptyOn404: true }), /Network failure/)
})

test('history joins resolutions by event id and forwards cancellation to both reads', async () => {
  const signal = new AbortController().signal
  const responses = {
    '/api/events/resolved/7': [{ id: 2 }, { id: 3 }, { id: 4 }],
    '/api/event_resolutions/many_chosen/?event_ids=2&event_ids=3&event_ids=4': [{ event_id: 3, id: 30 }, { event_id: 2, id: 20 }],
  }
  globalThis.fetch = async (url, options) => {
    assert.equal(options.signal, signal)
    assert.ok(url in responses, url)
    return json(responses[url])
  }
  const history = await loadEventHistory(7, signal)
  assert.deepEqual(history.map(item => item.resolution?.id), [20, 30, undefined])
})

test('empty history does not request chosen resolutions', async () => {
  globalThis.fetch = async url => {
    assert.equal(url, '/api/events/resolved/7')
    return json({ detail: 'No resolved events found' }, 404)
  }
  assert.deepEqual(await loadEventHistory(7, new AbortController().signal), [])
})

test('history preserves every event when no chosen resolutions exist', async () => {
  const event = { id: 8, name: 'Storm' }
  globalThis.fetch = async url => url === '/api/events/resolved/7'
    ? json([event])
    : json({ detail: 'No event resolutions found for that campaign' }, 404)
  assert.deepEqual(await loadEventHistory(7, new AbortController().signal), [{ event, resolution: undefined }])
})

test('settlement and treasury reads are independent of event history', async () => {
  const signal = new AbortController().signal
  const responses = { '/api/settlements/7': { name: 'Town' }, '/api/assets/7': { coffers: 42 } }
  globalThis.fetch = async (url, options) => {
    assert.ok(url in responses, url)
    assert.equal(options.signal, signal)
    return json(responses[url])
  }
  assert.deepEqual(await getSettlement('7', signal), { name: 'Town' })
  assert.deepEqual(await getAssets(7, signal), { coffers: 42 })
})

test('mutations use backend methods, query parameters and JSON contracts', async () => {
  const calls = []
  globalThis.fetch = async (url, options) => { calls.push([url, options]); return json({ id: 1 }) }
  await updateCoffers(7, 'donation', 10)
  await updateCoffers(7, 'withdrawal', 5)
  await buildProject(2)
  await decideResolution(3)
  const data = { event_id: 4, name: 'Resolution', description: '', income: 0, coffers: 1, resources: 0, defence: 0 }
  await createResolution(data)
  assert.deepEqual(calls.slice(0, 4).map(([url, options]) => [url, options.method]), [
    ['/api/assets/coffers_donation/7?donated_gold=10', 'PATCH'],
    ['/api/assets/coffers_withdrawal/7?withdrawn_gold=5', 'PATCH'],
    ['/api/buildings/build/2', 'PATCH'], ['/api/event_resolutions/decide/3', 'PATCH'],
  ])
  assert.equal(calls[4][0], '/api/event_resolutions/')
  assert.equal(calls[4][1].method, 'POST')
  assert.equal(calls[4][1].headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(calls[4][1].body), data)
})
