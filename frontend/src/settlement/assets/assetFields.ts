import type { Assets } from '../../api/models'

export const assetFields = [
  ['income', 'Доход'],
  ['coffers', 'Казна'],
  ['resources', 'Ресурсы'],
  ['defence', 'Обороноспособность'],
] as const satisfies ReadonlyArray<readonly [keyof Assets, string]>
