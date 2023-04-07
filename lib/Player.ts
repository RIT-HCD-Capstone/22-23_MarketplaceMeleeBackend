import Item from "./Item";

/** must include null so that having a stance by default doesn't cause a bug in gameplay */
export type PlayerStance = "Attack" | "Defend" | "Act" | null;

/**
 * The Player class handles the any actions a player can make, 
 * as well as tracking their relevant values and stats.
 */
export default class Player {
  id: string = '';
  stance: PlayerStance = null;
  baseStatAttack: number = 10;
  baseStatDefend: number = 10;
  value: number = 100;
  items: Item[] = [];
  readyState: boolean = false;
  playerAlive: boolean = true;

  /** assign the player an ID / name */
  name(name: string) { this.id = name }

  /** Attack another player, reducing damage done to their value by their Defense stat, and increasing their own value by the amount dealt. */
  attack(target: Player): Player {
    let damageDealt = this.statAttack() - target.statDefend()
    if (damageDealt <= 0) { return target }
    target.value = target.value - damageDealt
    this.value = this.value + damageDealt
    return target
  }

  /** nyi */
  act(): boolean { return false }

  /** Calculate the current Attack stat, inclusive of item modifiers. */
  statAttack(): number {
    let attackModifier: number = 0
    this.items.forEach(item => {
      if (item.effect.stat !== "Attack") {/* do nothing */ }
      attackModifier = attackModifier + item.effect.amount
    });
    return this.baseStatAttack + attackModifier
  }

  /** Calculate the current Defend stat, inclusive of item modifiers. */
  statDefend(): number {
    let defendModifier: number = 0
    this.items.forEach(item => {
      if (item.effect.stat !== "Defend") {/* do nothing */ }
      defendModifier = defendModifier + item.effect.amount
    });
    return this.baseStatDefend + defendModifier
  }

  /** declare stance */
  declareStance(stance: PlayerStance) {
    this.stance = stance
  }

  /** Prevent players from buying down to or below 0 value. */
  buyItem(item: Item): boolean {
    if (item.price >= this.value) { return false }
    this.items.push(item)
    return true
  }

  /** ready up */
  ready() { this.readyState = true }

  /** mods, crush his skull */
  die() { this.playerAlive = false }
}
