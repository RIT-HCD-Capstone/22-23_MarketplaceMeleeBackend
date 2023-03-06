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

// used for sending messages to every connected client
const messageBuilder = (
  server: FastifyInstance,
  message: string,
): void => {
  server.websocketServer.clients.forEach((client) => {
    client.send(message);
  });
};

const serverLog = (message: string): void => {
  console.log("SERVER:" + message);
};

const clientLog = (clientId: string, message: string): void => {
  console.log("CLIENT:" + clientId + ":" + message);
};

const addPlayer = (server: FastifyInstance, playerId: string): boolean => { // TODO should be a bool or something for error handling, just getting it done rn
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
      // console.log("SERVER: client connected - " + clientId);
      serverLog(" client connected - " + clientId);
      messageBuilder(server, "SERVER:clientConnected:" + clientId);
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
        // }
        switch (messageData[1]) {
          case "changeState": // TODO this is handled in the Game class; not here
            // TODO check that all players are ready to move to next phase
            // game.changeState(messageData[1]);
            // connection.socket.send(
            //   "turn: " + game.currentTurn + "\nphase: " +
            //     game.state,
            // );
            break;
          // case "nextTurn": NOTE this is gonna get taken care of in Game.changeState()
          //   // TODO check that all players have ended their turns
          //   currentGame.currentTurn++;
          //   connection.socket.send("startTurn: " + currentGame.currentTurn);
          //   break;
          default:
            break;
        }
        // connection.socket.send('hi from server')
      });
      connection.socket.on("close", () => {
        messageBuilder(server, "SERVER:" + clientId + ":disconnected");
        // console.log("client" + newClientId + " disconnected.");
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
