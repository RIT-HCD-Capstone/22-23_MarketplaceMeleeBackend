export default interface Item {
  name: string;
  description: string;
  consumable: boolean;
  numUses?: number;
  price: number;
  effect: Effect;
}

export type AffectedStats = 'Attack' | 'Defend' | 'Range'
export type EffectType = 'additive' | 'multiplicative'

export interface Effect {
  stat: AffectedStats
  type: EffectType
  amount: number
}
