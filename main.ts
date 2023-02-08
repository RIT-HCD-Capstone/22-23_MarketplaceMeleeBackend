import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { nanoid } from 'nanoid'

type GameState = "setup" | "move" | "declare" | "resolve" | "event"
type PlayerStance = "Attack" | "Defend" | "Act"

interface Item {
  name: string,
  description: string,
  consumable: boolean,
  numUses: number,
  price: number,
}

interface Player {
  // id: number,
  name: string,
  // state: GameState,
  // stance: PlayerStance,
  value: number,
  items: Item[],
  gameId: string,
}

let players: Player[]

interface Game {
  id: string,
  players: Player[],
  state: GameState,
}

function newGame(): Game {
  let game: Game = {
    id: nanoid(),
    players: [],
    state: "setup"
  }
  return game
}

function newPlayer(name: string, gameId: string): Player {
  let player: Player = {
    name,
    value: 100,
    items: [],
    gameId,
  }
  return player
}

function calcTurnOrder(players: Player[]): Player[] {
  var order: Player[] = players.sort((n1, n2) => n1.value - n2.value);
  return order
}

// webserver

const server: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
})

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          pong: {
            type: 'string'
          }
        }
      }
    }
  }
}

server.get('/ping', opts, async (request, reply) => {
  return { pong: 'it worked!' }
})

server.route({
  method: 'GET',
  url: '/',
  schema: {
    querystring: {
      name: { type: 'string' },
      excitement: { type: 'integer' }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  },
  handler: function (request, reply) {
    reply.send({ hello: 'world' })
  }
})

//TODO get websockets working
// server.register(require('@fastify/websocket'))

// server.register(async function (server) {
//   server.get('/socket', { websocket: "true" }, (connection /* SocketStream */, req /* FastifyRequest */) => {
//     connection.socket.on('message', message => {
//       // message.toString() === 'hi from client'
//       connection.socket.send('hi from server')
//     })
//   })
// })

const start = async () => {
  try {
    await server.listen({ port: 3883, host: '0.0.0.0' })

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port

  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
