import Item from "./Item";

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
    this.value += 50;
  }

  /** Calculate the current Attack stat, inclusive of item modifiers. */
  statAttack(): number {
    let attackModifier: number = 0;
    this.items.forEach((item) => {
      if (item.effect.stat !== "Attack") { /* do nothing */ }
      attackModifier = attackModifier + item.effect.amount;
    });
    return this.baseStatAttack + attackModifier;
  }

  /** Calculate the current Defend stat, inclusive of item modifiers. */
  statDefend(): number {
    let defendModifier: number = 0;
    this.items.forEach((item) => {
      if (item.effect.stat !== "Defend") { /* do nothing */ }
      defendModifier = defendModifier + item.effect.amount;
    });
    return this.baseStatDefend + defendModifier;
  }

  /** declare stance */
  declareStance(stance: PlayerStance) {
    this.stance = stance;
  }

  /** Prevent players from buying down to or below 0 value. */
  buyItem(item: string): boolean {
    let wantItem: Item;
    this.items.forEach((_item) => {
      if (_item.name === item) wantItem = _item;
    });
    if (wantItem!.price >= this.value) return false;
    this.items.push(wantItem!);
    this.value -= wantItem!.price;
    return true;
  }

  /** ready up */
  ready(): void {
    this.readyState = true;
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