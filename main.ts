import Fastify, {
  FastifyInstance,
  FastifyRequest,
  RouteShorthandOptions,
} from "fastify";
import { SocketStream, WebsocketHandler } from "@fastify/websocket";
import Game from "./lib/Game";
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

/** log a client message clientside */
const clientLog = (clientId: string, message: string): void => {
  console.log("CLIENT:" + clientId + ":" + message);
};

/** tries to add a new player to the game */
const addPlayer = (server: FastifyInstance, playerId: string): boolean => {
  if (typeof game == null) {
    return false;
  }
  game!.newPlayer(playerId);
  messageBuilder(server, "SERVER:newPlayer:" + playerId);
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
      // TODO right now only the first connected client gets all the info, each consecutive
      // connecting client needs to recieve data on all previously connected clients/players
      serverLog(" client connected - " + clientId);
      messageBuilder(server, "SERVER:clientConnected:" + clientId);
      // TODO this overwrites each client's original id, probably a client side fix
      if (game === null) {
        game = new Game();
        console.log("SERVER:" + " " + clientId + " created a new game!");
        messageBuilder(server, "SERVER:" + clientId + ":gameCreated");
      }
      // on connect, add as a player
      addPlayer(server, clientId);

      connection.socket.on("message", (data) => {
        let message = data.toString();
        clientLog(clientId, message);
        let messageData = message.split(":");
        // if (!game?.players.includes(messageData[0])) {
        // TODO check if the command is coming from a player (if it's not something else has fucked)
        // TODO check which player sent the command
        // }
        switch (messageData[1]) {
          case "startGame":
            break;
          case "changeState":
            game!.changeTurnState(
              messageData[2] as
              | "event"
              | "calculate"
              | "shop"
              | "move"
              | "declareStance"
              | "resolve",
            );
            break;
          default:
            break;
        }
      });
      connection.socket.on("close", () => {
        messageBuilder(server, "SERVER:" + clientId + ":disconnected");
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
