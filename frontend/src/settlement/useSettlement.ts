import { useState } from 'react'
import { errorMessage } from '../api/client'
import { createResolution, decideResolution, listActiveEvents, loadEventHistory } from '../api/events'
import type { CreateEventResolution } from '../api/models'
import { buildProject, getAssets, listBuildings, updateCoffers, type CoffersOperation } from '../api/settlements'
import { useKeyedQuery } from '../hooks/useQuery'
import { runSettlementWrite } from './settlementWrites'

export type SettlementTab = 'events' | 'buildings' | 'history'

export function useSettlement(id: number, tab: SettlementTab) {
  const assets = useKeyedQuery(getAssets, id)
  const events = useKeyedQuery(listActiveEvents, id, tab === 'events')
  const buildings = useKeyedQuery(listBuildings, id, tab === 'buildings')
  const history = useKeyedQuery(loadEventHistory, id, tab === 'history')
  const [write, setWrite] = useState<{ pending: boolean; error?: string }>({ pending: false })

  async function save(action: () => Promise<unknown>) {
    try {
      return await runSettlementWrite(id, async () => {
        setWrite({ pending: true })
        await action()
        setWrite({ pending: false })
      })
    } catch (cause) {
      // The server may have committed part of a command before the response failed.
      assets.reload()
      buildings.reload()
      events.reload()
      history.reload()
      setWrite({ pending: false, error: errorMessage(cause) })
      return false
    }
  }

  function transfer(operation: CoffersOperation, gold: number) {
    return save(async () => {
      const balance = await updateCoffers(id, operation, gold)
      assets.update(() => balance)
    })
  }

  function build(buildingId: number) {
    return save(async () => {
      const completed = await buildProject(buildingId)
      buildings.update(projects => projects.map(project => project.id === completed.id ? completed : project))
      assets.reload()
    })
  }

  function decide(resolutionId: number) {
    return save(async () => {
      const chosen = await decideResolution(resolutionId)
      events.update(current => current.filter(event => event.id !== chosen.event_id))
      history.reload()
      assets.reload()
    })
  }

  function create(draft: CreateEventResolution) {
    return save(() => createResolution(draft))
  }

  return {
    assets, events, buildings, history, transfer, build, decide, create, ...write,
  }
}
