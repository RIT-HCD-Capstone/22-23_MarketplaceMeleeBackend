import Fastify, { FastifyInstance, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { WebSocket } from 'ws'
import { SocketStream, WebsocketHandler } from '@fastify/websocket'
import { WebsocketPluginOptions } from '@fastify/websocket'
import { Server, IncomingMessage, ServerResponse } from 'http'
import dotenv from "dotenv"
dotenv.config()
// import { fastifyHelmet } from "@fastify/helmet";
// import { nanoid } from 'nanoid'
// const nanoid = await import('nanoid')

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
    // id: nanoid(6),
    id: "testid",
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

const fastify = require('fastify')({
  trustProxy: true
})

fastify.register(require('fastify-https-always'))

server.register(require('@fastify/helmet'))

server.register(require('@fastify/websocket'))

server.register(async function (server) {
  server.get('/socket', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
    console.log("client connected!")
    connection.socket.on('message', message => {
      // message.toString() === 'hi from client'
      console.log('message from client: ' + message)
      connection.socket.send('hi from server')
    })
    connection.socket.on('close', () => {
      console.log("client disconnected.")
    })
  })
})

const start = async () => {
  try {
    await server.listen({ port: process.env.PORT || 3883, host: '0.0.0.0' })

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port

  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
