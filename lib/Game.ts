import Player, { PlayerStance } from "./Player";

/** Tracks if the game is setting up or in play. */
type GameState = "setup" | "play";
/** Tracks the progression of each turn. */
type TurnState =
  | "event" // each turn's event. (assuming they ever actually get written lol)
  | "calculate" // completed objectives, pick new ones, update turn order
  | "shop" // the shop is open. purchase items and add them to players.
  | "move" // players are moving. wait for every player to indicate that they are done.
  | "declareStance" // players declare their stance: 'Act', 'Defend', or 'Act'.
  | "resolve"; // essentially a second "calculate", informs a player if they have died and removes them from the game

/** Amount of Value every player will lose per turn, up to 10 turns (at least for now). */
const DECAY_VALUES = [0, 5, 15, 40, 65, 105, 170, 275, 445, 720, 1165, 1885];

interface StanceToResolve {
  player: Player;
  target?: Player;
  stance: PlayerStance;
}

export default class Game {
  players: Player[] = [];
  gameState: GameState = "setup";
  shopEnabled: boolean = false;
  turn: number = 0;
  turnState: TurnState = "event";
  playerStances: StanceToResolve[] = [];

  /** Creates a new Player, then adds it to the Game Player's array. */
  newPlayer(id: string): boolean {
    if (this.gameState === "play") return false;
    let player: Player = new Player();
    player.name(id);
    this.players.push(player);
    return true;
  }

  /** Tries to find a Player with specified Id. Returns false if the player is not found. */
  getPlayerById(id: string): Player | boolean {
    let playerFound: Player = new Player();
    let foundPlayer: boolean = false;
    this.players.forEach((player) => {
      // console.log('player id: ' + player.id)
      // console.log('passed id: ' + id)
      if (player.id === id) {
        playerFound = player;
        foundPlayer = true;
      }
    });
    if (foundPlayer) return playerFound;
    return false;
  }

  calcTurnOrder(): void {
    this.players.sort((n1, n2) => n1.value - n2.value);
  }

  nextTurn(): boolean {
    if (!(this.gameState === "play")) return false;
    return true;
  }

  checkPlayerReadyState(): boolean {
    const ready = (player: Player) => player.readyState === false;
    if (this.players.some(ready)) return false;
    return true;
  }

  checkPlayerStanceState(): boolean {
    if (
      this.players.some((player) => {
        player.stance === null;
      })
    ) return false;
    return true;
  }

  unreadyAllPlayers(): void {
    this.players.forEach((player) => {
      player.unready();
    });
  }

  queuePlayerStance(
    player: Player,
    stance: PlayerStance,
    target?: Player,
  ): void {
    if (target !== null) {
      this.playerStances.push({
        player: player,
        target: target,
        stance: stance,
      });
    } else {
      this.playerStances.push(
        {
          player: player,
          stance: stance,
        },
      );
    }
  }

  playerStanceResolve(): void {
    // TODO work through the queue
    let player: Player;
    let target: Player;

    // this.playerStances.map()
    this.playerStances.forEach((action) => {
      if (action.player instanceof Player) {
        player = <Player>this.getPlayerById(action.player.id);
        player.declareStance(action.stance);
      }
    });

    this.playerStances.forEach((action) => {
      if (action.player instanceof Player) {
        player = <Player>this.getPlayerById(action.player.id);
        if (action.stance === "Act") player.act();
        if (action.target instanceof Player) {
          target = <Player>this.getPlayerById(action.target.id);
          if (action.stance === "Attack") {
            player.attack(target);
          }
        }
      }
    });
  }

  applyPlayerDecay(): void {
    const decay = (player: Player): void => {
      player.value = player.value - DECAY_VALUES[this.turn];
    };
    this.players.map(player => decay(player))
    this.applyPlayerDeathState();
  }

  applyPlayerDeathState(): Player[] {
    let deadPlayers: Player[] = [];
    this.players.forEach((player, index) => {
      if (player.value <= 0) player.die();
      if (player.playerAlive === false) {
        deadPlayers = deadPlayers.concat(this.players.splice(index, 1));
      }
    });
    return deadPlayers;
  }

  chooseActiveObjective(): number {
    const clamp = (num: number, min: number, max: number) =>
      Math.min(Math.max(num, min), max);
    return clamp(Math.random(), 0, this.players.length - 1);
  }

  changeGameState(state: GameState): boolean {
    if (this.checkPlayerReadyState()) {
      switch (state) {
        case "setup":
          this.gameState = "setup";
          return true;
        case "play":
          this.gameState = "play";
          return true;
      }
    }
    return false;
  }

  changeTurnState(state: TurnState): boolean {
    if (this.checkPlayerReadyState()) {
      switch (state) {
        case "event":
          this.turnState = "event";
          // TODO trigger event
          this.unreadyAllPlayers();
          return true;
        case "calculate":
          this.turnState = "calculate";
          this.calcTurnOrder();
          return true;
        case "shop":
          if (!this.shopEnabled) this.changeTurnState("move");
          this.turnState = "shop";
          this.unreadyAllPlayers();
          return true;
        case "move":
          this.turnState = "move";
          this.unreadyAllPlayers();
          return true;
        case "declareStance":
          this.turnState = "declareStance";
          this.unreadyAllPlayers();
          this.changeTurnState("resolve");
          return true;
        case "resolve":
          this.playerStanceResolve();
          this.turnState = "resolve";
          this.applyPlayerDecay();
          this.applyPlayerDeathState();
          this.turn++;
          this.unreadyAllPlayers();
          return true;
      }
    }
    return false;
  }
}
