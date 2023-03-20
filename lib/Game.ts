import Player from "./Player";

// Enums
type GameState = "setup" | "play";
type TurnState =
  | "event" // each turn's event. (assuming they ever actually get written lol)
  | "calculate" // check for completed bounties, completed objectives, pick new ones, update turn order
  | "shop" // the shop is open. purchase items and add them to players.
  | "move" // players are moving. wait for every player to indicate that they are done.
  | "declareStance" // players declare their stance: 'Act', 'Defend', or 'Act'.
  | "resolve"; // essentially a second "calculate", informs a player if they have died and removes them from the game
// type DecayValues = 0 | 5 | 15 | 40 | 65 | 105 | 170 | 275;

// Modifiers & permanants
const MONOPOLIZE_BONUS: number = 5; // multiplicative
const DECAY_VALUES = [0, 5, 15, 40, 65, 105, 170, 275];

export default class Game {
  id: string = "testid";
  players: Player[] = [];
  gameState: GameState = "setup";
  turn: number = 0;
  turnState: TurnState = "event";

  newPlayer(id: string): boolean {
    if (this.gameState === "play") return false;
    let player: Player = {
      id: id,
      value: 100,
      items: [],
      stance: null,
      readyState: false,
    };
    this.players.push(player);
    return true;
  }

  calcTurnOrder(): void {
    this.players.sort((n1, n2) => n1.value - n2.value);
  }

  nextTurn(): boolean {
    if (this.gameState === "play") return false;
    let currentTurn: number = this.turn;
    if (currentTurn === 1) {
      // bounties start here
    }
    if (currentTurn === 2) {
      // shop starts here
    }
    return true;
  }

  checkPlayerReadyState(): boolean {
    function eachPlayer(element: Player): boolean {
      if (element.readyState) return true;
      return false;
    }
    return this.players.every(eachPlayer);
  }

  applyPlayerDecay(): void {
    const decay = (element: Player): void => {
      element.value = element.value - DECAY_VALUES[this.turn];
    };
    this.players.every(decay);
  }

  changeGameState(state: GameState): boolean {
    if (!this.checkPlayerReadyState()) return false;
    switch (state) {
      case "setup":
        this.gameState = "setup";
        return true;
      case "play":
        this.gameState = "play";
        return true;
    }
  }

  changeTurnState(state: TurnState): boolean {
    if (!this.checkPlayerReadyState()) return false;
    // TODO increment turn
    // TODO trigger effects
    switch (state) {
      case "event":
        this.turnState = "event";
        return true;
      case "calculate":
        if (!this.checkPlayerReadyState()) return false;
        this.turnState = "calculate";
        this.calcTurnOrder();
        return true;
      case "shop":
        this.turnState = "shop";
        return true;
      case "move":
        if (!this.checkPlayerReadyState()) return false;
        this.turnState = "move";
        return true;
      case "declareStance":
        if (!this.checkPlayerReadyState()) return false;
        this.turnState = "declareStance";
        return true;
      case "resolve":
        if (!this.checkPlayerReadyState()) return false;
        this.turnState = "resolve";
        this.applyPlayerDecay();
        this.turn++;
        return true;
    }
  }
}
