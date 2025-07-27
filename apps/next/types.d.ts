import { config } from '@my/config'
import { Connection } from 'mongoose'

export type Conf = typeof config

declare module '@my/ui' {
  interface TamaguiCustomConfig extends Conf {}
}

declare global {
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  }
}

export {}
