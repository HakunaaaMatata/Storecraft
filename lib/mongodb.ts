import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || ''

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0)
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri)
      clientPromise = client.connect()
    }
    return clientPromise
  }
}

export async function getDb(): Promise<Db | null> {
  const mongo = await getMongoClient()
  if (!mongo) return null
  return mongo.db(process.env.MONGODB_DB_NAME || 'storecraft')
}
