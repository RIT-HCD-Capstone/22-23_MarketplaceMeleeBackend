/** Items that can be purchased from the shop. Modifies the player's stats in different ways. */
export default interface Item {
  name: string;
  description: string;
  consumable: boolean;
  numUses?: number;
  price: number;
  rarity: Rarity;
  effect: Effect;
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary'

/** The stat that the item effects */
export type AffectedStats = 'Attack' | 'Defend' | 'Range'
/** the type of effect */
export type EffectType = 'additive' | 'multiplicative'

/** The effected stat, type, and volume of the change */
export interface Effect {
  stat: AffectedStats
  type: EffectType
  amount: number
}
