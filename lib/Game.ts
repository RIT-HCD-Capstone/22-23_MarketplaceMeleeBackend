import Player from "./Player";

// Enums
type GameState = "setup" | "play";
type TurnState =
  | "event"
  | "calculate"
  | "shop"
  | "move"
  | "declareStance"
  | "resolve";
type DecayValues = 0 | 5 | 15 | 40 | 65 | 105 | 170 | 275;

// Modifiers
const MONOPOLIZE_BONUS: number = 5; // multiplicative

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

  changeGameState(state: GameState): boolean {
    // TODO check if ALL players are ready to transition to next state
    // TODO change to next state
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
    // TODO check if ALL players are ready to transition to next state
    // TODO change to next state
    // TODO increment turn
    // TODO trigger effects
    switch (state) {
      case "event":
        this.turnState = "event";
        return true;
      case "calculate":
        this.turnState = "calculate";
        this.calcTurnOrder();
        return true;
      case "shop":
        this.turnState = "shop";
        return true;
      case "move":
        this.turnState = "move";
        return true;
      case "declareStance":
        this.turnState = "declareStance";
        return true;
      case "resolve":
        this.turnState = "resolve";
        return true;
    }
  }
}
