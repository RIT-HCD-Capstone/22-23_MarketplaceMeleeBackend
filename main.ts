import Fastify, {
  FastifyInstance,
  FastifyRequest,
  RouteShorthandOptions,
} from "fastify";
import { SocketStream } from "@fastify/websocket";
import Game from "./lib/Game";
import Player, { ClientPlayerData, PlayerStance } from "./lib/Player";
import Item, { AllItems } from "./lib/Item";
import { YearlyEvents } from "./lib/Events";
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
  message = "SERVER$$" + message;
  server.websocketServer.clients.forEach((client) => {
    client.send(message);
  });
};

/** tries to add a new player to the game */
const addPlayer = (server: FastifyInstance, playerId: string): boolean => {
  if (typeof game == null) {
    return false;
  }
  game!.newPlayer(playerId);
  let thisPlayer = game?.getPlayerById(playerId);
  let playerToSend;
  if (thisPlayer instanceof Player) playerToSend = thisPlayer.export();
  messageBuilder(
    server,
    "newPlayer$$" + JSON.stringify(playerToSend),
  );
  console.log(" new player added to game: " + playerId);
  return true;
};

const sendAllPlayers = (server: FastifyInstance, allPlayers: Player[]): void => {
  let sendablePlayers: ClientPlayerData[] = []

  allPlayers.forEach(player => {
    let sendable = player.export()
    sendablePlayers.push(sendable);
  })

  messageBuilder(
    server,
    "allPlayers$$" + JSON.stringify(sendablePlayers),
  );
}

const sendDeadPlayers = (server: FastifyInstance, deadPlayers: Player[]): void => {
  messageBuilder(server, 'playerDeath$$' + JSON.stringify(deadPlayers))
}

const sendItems = (server: FastifyInstance): void => {
  let sendableItems: Item[] = []

  for (let index = 0; index < 3; index++) {
    const item = AllItems[Math.floor(Math.random() * AllItems.length)];
    sendableItems.push(item)
  }
  messageBuilder(server, 'shopItems$$' + JSON.stringify(sendableItems))
}

const sendEvent = (server: FastifyInstance) => {
  messageBuilder(server, 'event$$' + JSON.stringify(YearlyEvents[game?.turn!]))
}

const sendActiveObjective = (server: FastifyInstance) => {
  messageBuilder(server, 'objective$$' + game?.chooseActiveObjective())
}

server.register(async function (server) {
  server.get(
    "/socket",
    { websocket: true },
    (connection: SocketStream, _req: FastifyRequest) => {
      // on first connect

      if (game !== null && game?.gameState !== 'setup') connection.end()

      let clientId: string = randomWords();
      console.log(" client connected - " + clientId);
      messageBuilder(server, "clientConnected$$" + clientId);

      if (game === null) {
        game = new Game();
        console.log("SERVER:" + " " + clientId + " created a new game!");
        messageBuilder(server, clientId + "$$gameCreated");
      }

      addPlayer(server, clientId);

      sendAllPlayers(server, game.players)

      connection.socket.on("message", (data) => {
        let message = data.toString();
        console.log(clientId, message);
        let messageData = message.split("$$");
        let messageSource: string = messageData[0]
        let client: string = messageData[1];
        let player = game!.getPlayerById(client);
        let command: string = messageData[2];
        let extra: string = messageData[3];
        /** ONLY used when recieving CLIENT$$declareStance$$Attack$$targetedPlayer */
        let targetedPlayer = game!.getPlayerById(messageData[4]);
        if (messageSource === 'CLIENT') {
          switch (command) {
            case 'ready':
              if (player instanceof Player) player.ready();
              break;
            /** sent when a client manually starts the game. */
            case "startGame":
              console.log(game?.changeGameState("play"))
              if (!(game?.changeGameState("play"))) break
              if (!(game?.changeTurnState("event"))) break
              messageBuilder(server, "gameEvent");
              sendItems(server);
              sendEvent(server);
              sendActiveObjective(server);
              sendAllPlayers(server, game!.players)
              break;
            /** sent from the shop screen with the name of the intended purchase */
            case "shop":
              if (player instanceof Player) player.buyItem(extra);
              console.log('player bbought item: ' + extra)
              sendAllPlayers(server, game!.players)
              break;
            case "requestNewItems":
              if (player instanceof Player) {
                if (player.value > 5) {
                  player.value -= 5
                } else {
                  break
                }
              };
              sendItems(server);
              sendAllPlayers(server, game!.players)
              break;
            case "doneShopping":
              if (!(game?.changeTurnState("move"))) break
              game?.changeTurnState("move")
              messageBuilder(server, "gameMove");
              sendAllPlayers(server, game!.players)
              break;
            /** sent when a player is done moving, triggers attempt to change to declareStance */
            case "move":
              if (!(game?.changeTurnState("declareStance"))) break
              game?.changeTurnState("declareStance")
              messageBuilder(server, "gameStance");
              sendAllPlayers(server, game!.players)
              break;
            /** sent when a player has declaredStance, triggers attempt to change to resolve */
            case "declareStance":
              if (player instanceof Player && !(targetedPlayer instanceof Player)) {
                game?.queuePlayerStance(player, <PlayerStance>extra)
                console.log('player being queued:' + player.id)
                console.log('stance being queued:' + <PlayerStance>extra)
              }
              if (player instanceof Player && targetedPlayer instanceof Player) {
                game?.queuePlayerStance(player, <PlayerStance>extra, targetedPlayer)
                console.log('player being queued:' + player.id)
                console.log('stance being queued:' + <PlayerStance>extra)
                console.log('target being queued:' + targetedPlayer.id)
              }
              // console.log('declareStance finished queueing stances')
              if (!(game?.changeTurnState("resolve"))) break
              game?.changeTurnState("resolve")
              sendAllPlayers(server, game!.players)
              sendEvent(server);
              sendActiveObjective(server);
              messageBuilder(server, "gameResolve");
              break;
          }
        }
        if (messageSource === 'ADMIN') {
          switch (command) {
            /** when you just gotta wipe it out start over */
            case "resetGame":
              game = new Game();
              break;
            /** admin command to kill specified player */
            case 'killPlayer':
              if (player instanceof Player) player.die();
              // sendDeadPlayers(server, game!.applyPlayerDeathState());
              sendAllPlayers(server, game!.players)
              break;
            /** admin command to increase specified player's value by 10 */
            case 'valueUp':
              if (player instanceof Player) player.value += 10;
              // sendDeadPlayers(server, game!.applyPlayerDeathState());
              sendAllPlayers(server, game!.players)
              break;
            /** admin command to decrease specified player's value by 10 */
            case 'valueDown':
              if (player instanceof Player) player.value -= 10;
              // sendDeadPlayers(server, game!.applyPlayerDeathState());
              sendAllPlayers(server, game!.players)
              break;
            /** admin command to add a given item to given player */
            case 'addItem':
              // if (player instanceof Player) player.buyItem();
              sendAllPlayers(server, game!.players)
              break;
            default:
              break;
          }
        }
      });

      /** When the socket closes, kill the player created by that Client. */
      connection.socket.on("close", () => {
        let thisPlayer = game!.getPlayerById(clientId);
        if (thisPlayer instanceof Player) {
          thisPlayer.die();
          // sendDeadPlayers(server, game!.applyPlayerDeathState());
        }
        messageBuilder(server, clientId + "$$disconnected");
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
