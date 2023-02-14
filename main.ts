import Fastify, {
  FastifyInstance,
  FastifyRequest,
  RouteShorthandOptions,
} from "fastify";
import { WebSocket } from "ws";
import { SocketStream, WebsocketHandler } from "@fastify/websocket";
import { WebsocketPluginOptions } from "@fastify/websocket";
import { IncomingMessage, Server, ServerResponse } from "http";
var randomWords = require("random-words");

type GameState = "setup" | "move" | "declareStance" | "resolve" | "event";
type PlayerStance = "Attack" | "Defend" | "Act";

// Modifiers
const MONOPOLIZE_BONUS: number = 5; // multiplicative

interface Item {
  name: string;
  description: string;
  consumable: boolean;
  numUses: number;
  price: number;
}

interface Player {
  // id: number,
  id: string;
  // state: GameState,
  // stance: PlayerStance,
  value: number;
  items: Item[];
}

class Game {
  id: string = "testid";
  players: Player[] = [];
  state: GameState = "setup";
  currentTurn: number = 0;

  newPlayer(id: string): void {
    let player: Player = {
      id: id,
      value: 100,
      items: [],
    };
    this.players.push(player);
  }

  calcTurnOrder(): void {
    this.players.sort((n1, n2) => n1.value - n2.value);
  }

  changeState(data: string): void {
    //todo check if ALL players are ready to transition to next state
    //todo change to next state
    //todo increment turn
    //todo trigger effects
    switch (data) {
      case "setup":
        currentGame.state = "move";

        break;
      case "move":
        currentGame.state = "declareStance";
        break;
      default:
        break;
    }
  }
}

// gamedata

let currentGame: Game;

// webserver

const server: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
  trustProxy: true,
});

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          pong: {
            type: "string",
          },
        },
      },
    },
  },
};

server.get("/", opts, async (_request, _reply) => {
  return { hello: "world!" };
});

server.register(require("fastify-https-always"));
server.register(require("@fastify/helmet"));
server.register(require("@fastify/websocket"));

server.register(async function (server) {
  server.get(
    "/socket",
    { websocket: true },
    (connection: SocketStream, req: FastifyRequest) => {
      console.log("new client connected!");
      let newClientId: string = randomWords();
      connection.socket.send("newClientConnected:" + newClientId);
      connection.socket.on("message", (data) => {
        let message = data.toString();
        console.log("message from client: " + message);
        let messageData = message.split(":");
        switch (messageData[0]) {
          case "newGame":
            currentGame = new Game();
            console.log("new game started!");
            connection.socket.send("gameStarted");
            break;
          case "newPlayer":
            if (!(typeof currentGame === undefined)) {
              console.log("Game not started yet!");
              connection.socket.send("error:noGameExists");
              break;
            }
            currentGame.newPlayer(messageData[1]);
            console.log("new player added!");
            console.log("Players:");
            for (const player in currentGame.players) {
              if (
                Object.prototype.hasOwnProperty.call(
                  currentGame.players,
                  player,
                )
              ) {
                const element = currentGame.players[player];
                console.log(element);
              }
            }
            break;
          case "changeState":
            //TODO check that all players are ready to move to next phase
            currentGame.changeState(messageData[1]);
            connection.socket.send(
              "turn: " + currentGame.currentTurn + "\nphase: " +
                currentGame.state,
            );
            break;
          // case "nextTurn": NOTE this is gonna get taken care of in Game.changeState()
          //   //TODO check that all players have ended their turns
          //   currentGame.currentTurn++;
          //   connection.socket.send("startTurn: " + currentGame.currentTurn);
          //   break;
          default:
            break;
        }
        // connection.socket.send('hi from server')
      });
      connection.socket.on("close", () => {
        console.log("client disconnected.");
      });
    },
  );
});

const start = async () => {
  try {
    await server.listen({ port: 3883, host: "0.0.0.0" });

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
