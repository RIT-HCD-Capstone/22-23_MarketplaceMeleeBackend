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

/** The rarity of the items, how commonly they appear in the shop */
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary'

/** The stat that the item effects */
export type AffectedStats = 'Attack' | 'Defend' | 'Range' | 'Value'
/** the type of effect */
export type EffectType = 'additive' | 'multiplicative'

/** The effected stat, type, and volume of the change */
export interface Effect {
  stat: AffectedStats
  type: EffectType
  amount: number
}

export let AllItems: Item[] =
  [{
    name: "Spear",
    description: "Double attack range",
    rarity: "Legendary",
    price: 30,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Range",
      type: "multiplicative",
      amount: 2
    }
  },

  {
    name: "Pointy Stick",
    description: "Increase attack damage by 30",
    rarity: "Rare",
    price: 40,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Attack",
      type: "additive",
      amount: 30
    }
  },

  {
    name: "Non copyright infringing blue hedgehog shoes",
    description: "Increase your movement range by half your starting range",
    rarity: "Rare",
    price: 40,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Range",
      type: "multiplicative",
      amount: 1.5
    }
  },

  {
    name: "Bucket of Teeth",
    description: "You now have more teeth. Do 2 extra damage per attack",
    rarity: "Uncommon",
    price: 5,
    consumable: false,
    numUses: 5,
    effect: {
      stat: "Attack",
      type: "additive",
      amount: 2
    }
  },

  {
    name: "'Axe' Body Spray",
    description: "Nobody can move within attack range of you next turn",
    rarity: "Rare",
    price: 15,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Range",
      type: "additive",
      amount: 0
    }
  },

  {
    name: "Bucket of Rocks",
    description: "You now have a bucket of rocks. Do 5 extra damage per attack, can attack from your move range",
    rarity: "Rare",
    price: 15,
    consumable: false,
    numUses: 5,
    effect: {
      stat: "Attack",
      type: "additive",
      amount: 5
    }
  },

  {
    name: "Bond",
    description: "Gain 80 in two turns",
    rarity: "Uncommon",
    price: 20,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Value",
      type: "additive",
      amount: 80
    }
  },

  {
    name: "Sacrificial Dagger",
    description: "Your next attack grants quadruple the value of the damage dealt",
    rarity: "Legendary",
    price: 50,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Value",
      type: "multiplicative",
      amount: 4
    }
  },

  {
    name: "Gilded Shield",
    description: "Block 3 times, gain 80",
    rarity: "Uncommon",
    price: 20,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Value",
      type: "additive",
      amount: 80
    }
  },

  {
    name: "Bucket of Dragon Teeth",
    description: "You now have Spyro's teeth. Do 45 extra damage per attack",
    rarity: "Legendary",
    price: 50,
    consumable: false,
    numUses: 3,
    effect: {
      stat: "Attack",
      type: "additive",
      amount: 45
    }
  },

  {
    name: "Survey Contract",
    description: "Sell at 3 different Marketplaces, gain double the value you gained from selling at them",
    rarity: "Uncommon",
    price: 15,
    consumable: false,
    numUses: 1,
    effect: {
      stat: "Value",
      type: "multiplicative",
      amount: 2
    }
  },

  {
    name: "Tree Branch",
    description: "Do 10 extra damage on your next attack",
    rarity: "Common",
    price: 10,
    consumable: true,
    numUses: 1,
    effect: {
      stat: "Attack",
      type: "additive",
      amount: 10
    }
  },

  {
    name: "Armor",
    description: "Save 10 more value on your next save",
    rarity: "Common",
    price: 5,
    consumable: true,
    numUses: 1,
    effect: {
      stat: "Defend",
      type: "additive",
      amount: 10
    }
  }]


