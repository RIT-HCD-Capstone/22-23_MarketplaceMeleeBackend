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
export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary";

/** The stat that the item effects */
export type AffectedStats = "Attack" | "Defend" | "Range" | "Value";
/** the type of effect */
export type EffectType = "+" | "x";

/** The effected stat, type, and volume of the change */
export interface Effect {
  stat: AffectedStats;
  type: EffectType;
  amount: number;
}

export let AllItems: Item[] = [{
  name: "Spear",
  description: "Double attack range",
  rarity: "Legendary",
  price: 30,
  consumable: false,
  effect: {
    stat: "Range",
    type: "x",
    amount: 2,
  },
}, {
  name: "Pointy Stick",
  description: "Increase attack damage by 30",
  rarity: "Rare",
  price: 40,
  consumable: true,
  effect: {
    stat: "Attack",
    type: "+",
    amount: 30,
  },
}, {
  name: "Non copyright infringing blue hedgehog shoes",
  description: "Increase your movement range by 1.5x your starting range",
  rarity: "Rare",
  price: 40,
  consumable: false,
  effect: {
    stat: "Range",
    type: "x",
    amount: 1.5,
  },
}, {
  name: "Bucket of Teeth",
  description: "You now have more teeth. Do 2 extra damage per attack",
  rarity: "Uncommon",
  price: 5,
  consumable: true,
  numUses: 5,
  effect: {
    stat: "Attack",
    type: "+",
    amount: 2,
  },
}, {
  name: "Bucket of Rocks",
  description:
    "You now have a bucket of rocks. Do 5 extra damage per attack.",
  rarity: "Rare",
  price: 15,
  consumable: true,
  numUses: 5,
  effect: {
    stat: "Attack",
    type: "+",
    amount: 5,
  },
}, {
  name: "Bond",
  description: "Gain 40 extra value when acting, twice.",
  rarity: "Uncommon",
  price: 20,
  consumable: true,
  numUses: 2,
  effect: {
    stat: "Value",
    type: "+",
    amount: 40,
  },
}, {
  name: "Sacrificial Dagger",
  description:
    "Your next attack deals 4x damage.",
  rarity: "Legendary",
  price: 60,
  consumable: true,
  numUses: 1,
  effect: {
    stat: "Attack",
    type: "x",
    amount: 4,
  },
}, {
  name: "Gilded Shield",
  description: "Permanantly increase your save value by 20",
  rarity: "Uncommon",
  price: 40,
  consumable: false,
  numUses: 1,
  effect: {
    stat: "Defend",
    type: "+",
    amount: 20,
  },
}, {
  name: "Bucket of Dragon Teeth",
  description: "You have collected a few of Spyro's teeth. Do 25 extra damage per attack",
  rarity: "Legendary",
  price: 50,
  consumable: true,
  numUses: 3,
  effect: {
    stat: "Attack",
    type: "+",
    amount: 25,
  },
}, {
  name: "Survey Contract",
  description:
    "Double the value gained through Selling at the next Marketplace you sell at.",
  rarity: "Uncommon",
  price: 15,
  consumable: true,
  numUses: 1,
  effect: {
    stat: "Value",
    type: "x",
    amount: 2,
  },
}, {
  name: "Tree Branch",
  description: "Do 10 extra damage on your next attack",
  rarity: "Common",
  price: 10,
  consumable: true,
  numUses: 1,
  effect: {
    stat: "Attack",
    type: "+",
    amount: 10,
  },
}, {
  name: "Armor",
  description: "Save 10 more value on your next save",
  rarity: "Common",
  price: 5,
  consumable: true,
  numUses: 1,
  effect: {
    stat: "Defend",
    type: "+",
    amount: 10,
  },
}];
