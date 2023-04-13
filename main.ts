import Fastify, {
  FastifyInstance,
  FastifyRequest,
  RouteShorthandOptions,
} from "fastify";
import { SocketStream } from "@fastify/websocket";
import Game from "./lib/Game";
import Player, { PlayerStance } from "./lib/Player";
var randomWords = require("random-words");

// gamedata
let game: Game | null = null;

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
server.register(require("@fastify/websocket"), {
  options: { clientTracking: true },
});

/** used for sending messages to every connected client */
const messageBuilder = (
  server: FastifyInstance,
  message: string,
): void => {
  server.websocketServer.clients.forEach((client) => {
    client.send(message);
  });
};

/** log a server message serverside */
const serverLog = (message: string): void => {
  console.log("SERVER:" + message);
};

/** log a client message serverside */
const clientLog = (clientId: string, message: string): void => {
  console.log("CLIENT:" + clientId + ":" + message);
};

/** tries to add a new player to the game */
const addPlayer = (server: FastifyInstance, playerId: string): boolean => {
  if (typeof game == null) {
    return false;
  }
  game!.newPlayer(playerId);
  messageBuilder(
    server,
    "SERVER$$newPlayer$$" + JSON.stringify(game?.getPlayerById(playerId)),
  );
  serverLog(" new player added to game: " + playerId);
  return true;
};

server.register(async function (server) {
  server.get(
    "/socket",
    { websocket: true },
    (connection: SocketStream, req: FastifyRequest) => {
      // on first connect
      let clientId: string = randomWords();
      serverLog(" client connected - " + clientId);
      messageBuilder(server, "SERVER$$clientConnected$$" + clientId);

      // TODO this check does not work
      if (game === null) {
        game = new Game();
        console.log("SERVER:" + " " + clientId + " created a new game!");
        messageBuilder(server, "SERVER$$" + clientId + "$$gameCreated");
      }
      // on connect, add as a player
      addPlayer(server, clientId);

      messageBuilder(
        server,
        "SERVER$$allPlayers$$" + JSON.stringify(game.players),
      );

      connection.socket.on("message", (data) => {
        let message = data.toString();
        clientLog(clientId, message);
        let messageData = message.split("$$");
        let client: string = messageData[1];
        let player = game!.getPlayerById(client);
        let command: string = messageData[2];
        let extra: string = messageData[3];
        /** ONLY used when recieving CLIENT$$declareStance$$Attack$$targetedPlayer */
        let targetedPlayer = game!.getPlayerById(messageData[4]);
        switch (command) {
          /** sent when a client manually starts the game. */
          case "startGame":
            game?.changeGameState("play");
            break;
          /** when you just gotta wipe it out start over */
          case "resetGame":
            game = new Game();
            break;
          /** sent from the shop screen with the name of the intended purchase */
          case "shop":
            if (player instanceof Player) return player.buyItem(extra);
            break;
          /** sent when a player is done moving, triggers attempt to change to declareStance */
          case "move":
            game?.changeTurnState("declareStance");
            break;
          /** sent when a player has declaredStance, triggers attempt to change to resolve */
          case "declareStance":
            if (player instanceof Player) {
              if (targetedPlayer instanceof Player) {
                game?.playerStanceResolve(player, targetedPlayer);
                break;
              }
              game?.playerStanceResolve(player);
            }
            game?.changeTurnState("resolve");
            break;
          default:
            break;
        }
      });

      /** When the socket closes, kill the player created by that Client. */
      connection.socket.on("close", () => {
        let thisPlayer = game!.getPlayerById(clientId);
        if (thisPlayer instanceof Player) {
          thisPlayer.die();
        }
        messageBuilder(server, "SERVER$$" + clientId + "$$disconnected");
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
