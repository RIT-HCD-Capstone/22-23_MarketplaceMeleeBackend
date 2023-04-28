import Item, { AllItems } from "./Item";

/** must include null so that having a stance by default doesn't cause a bug in gameplay */
export type PlayerStance = "Attack" | "Defend" | "Act" | null;

/**
 * The Player class handles the any actions a player can make,
 * as well as tracking their relevant values and stats.
 */
export default class Player {
  id: string = "";
  stance: PlayerStance = null;
  baseStatAttack: number = 10;
  baseStatDefend: number = 10;
  value: number = 100;
  items: Item[] = [];
  readyState: boolean = false;
  playerAlive: boolean = true;

  /** assign the player an ID / name */
  name(name: string) {
    this.id = name;
  }

  /** Attack another player, with different modifiers based on target stance,
   *  and increasing their own value by the amount dealt. */
  attack(target: Player): Player {
    let damageDealt: number;
    /** no damage modifiers */
    if (target.stance == 'Attack') {
      damageDealt = this.statAttack()
    }
    /** damage is decreased by target's Defense stat */
    if (target.stance == 'Defend') {
      damageDealt = this.statAttack() - target.statDefend();
    }
    /** damage is doubled against Acting players */
    if (target.stance == 'Act') {
      damageDealt = this.statAttack() * 2
    }

    /** if dealing no damage, deal no damage. */
    if (damageDealt! <= 0) return target;
    target.value = target.value - damageDealt!;
    this.value = this.value + damageDealt!;
    return target;
  }

  /** gain 50 value */
  act(): void {
    let actModifier: number = 0;
    if (this.items.length > 0) {
      this.items.map((item) => {
        if (item.effect.stat === "Value") {
          if (item.effect.type === '+') {
            actModifier = actModifier + item.effect.amount;
            if (item.consumable) item.numUses! -= 1
            this.value = this.value + 50 + actModifier
          };
        }
      });
      this.items.map((item) => {
        if (item.effect.stat === "Value") {
          if (item.effect.type === 'x') {
            actModifier = actModifier * item.effect.amount;
            if (item.consumable) item.numUses! -= 1
            this.value = this.value + (50 * actModifier)
          }
        }
      });
    } else {
      this.value = this.value + 50
    }
  }

  // /** The stat that the item effects */
  // export type AffectedStats = "Attack" | "Defend" | "Range" | "Value";
  // /** the type of effect */
  // export type EffectType = "+" | "x";

  /** Calculate the current Attack stat, inclusive of item modifiers. */
  statAttack(): number {
    let attackModifier: number = 0;
    this.items.map((item) => {
      if (item.effect.stat === "Attack") {
        if (item.effect.type === '+') attackModifier = attackModifier + item.effect.amount;
        if (item.consumable) item.numUses! -= 1
      }
    });
    this.items.map((item) => {
      if (item.effect.stat === "Attack") {
        if (item.effect.type === 'x') attackModifier = attackModifier * item.effect.amount;
        if (item.consumable) item.numUses! -= 1
      }
    });
    return this.baseStatAttack + attackModifier;
  }

  /** Calculate the current Defend stat, inclusive of item modifiers. */
  statDefend(): number {
    let defendModifier: number = 0;
    this.items.map((item) => {
      if (item.effect.stat === "Defend") {
        if (item.effect.type === '+') defendModifier = defendModifier + item.effect.amount;
        if (item.consumable) item.numUses! -= 1
      }
    });
    this.items.map((item) => {
      if (item.effect.stat === "Defend") {
        if (item.effect.type === 'x') defendModifier = defendModifier * item.effect.amount;
        if (item.consumable) item.numUses! -= 1
      }
    });
    return this.baseStatDefend + defendModifier;
  }

  /** declare stance */
  declareStance(stance: PlayerStance) {
    this.stance = stance;
  }

  /** Tries to buy an item with the given name. Prevents players from buying down to or below 0 value. */
  buyItem(itemName: string): boolean {
    console.log('buying item: ' + itemName)
    AllItems.map((item) => {
      if (item.name === itemName) {
        if (item.price >= this.value) return false;
        this.value -= item.price;
        this.items.push(item);
      }
    });
    return true;
  }

  /** ready up */
  ready(): void {
    this.readyState = true;
  }
  /** ready down */
  unready(): void {
    this.readyState = false;
  }

  /** mods, crush his skull */
  die(): void {
    this.playerAlive = false;
  }

  export(): ClientPlayerData {
    return {
      id: this.id,
      stance: this.stance,
      statAttack: this.statAttack(),
      statDefend: this.statDefend(),
      value: this.value,
      items: this.items,
      readyState: this.readyState,
      playerAlive: this.playerAlive,
    }
  }
}

/** Sends the current state of each player to the Client. */
export interface ClientPlayerData {
  id: string;
  stance: PlayerStance;
  statAttack: number;
  statDefend: number;
  value: number;
  items: Item[];
  readyState: boolean;
  playerAlive: boolean;
}