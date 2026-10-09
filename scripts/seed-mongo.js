const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

const uri = 'mongodb+srv://akashk79026_db_user:Storecraft2026@cluster0.8pscyrl.mongodb.net/storecraft?retryWrites=true&w=majority&appName=Cluster0'

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db('storecraft')

  const jsonDbPath = path.join(__dirname, '../data/storecraft-db.json')
  let stores = []
  let users = []

  if (fs.existsSync(jsonDbPath)) {
    const raw = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'))
    stores = raw.stores || []
    users = raw.users || []
  }

  // Ensure default demo user exists
  const defaultUser = {
    id: 'user-demo-jamie-davis',
    name: 'Jamie Davis',
    email: 'owner@storecraft.demo',
    passwordHash: 'dd79736083a9f0684080691cf3233a337c3ff22ee903b28f340d7769a0d224ed373cb0575f6df5932abc61bd46acc951e88c28c0c090aaceb1c428091ac3af94',
    salt: 'demo-salt-storecraft-2026',
    createdAt: '2026-01-01T00:00:00.000Z'
  }

  if (!users.some(u => u.email === defaultUser.email)) {
    users.push(defaultUser)
  }

  console.log(`Seeding ${stores.length} stores and ${users.length} users into MongoDB Atlas...`)

  if (stores.length > 0) {
    await db.collection('stores').deleteMany({})
    await db.collection('stores').insertMany(stores)
  }

  if (users.length > 0) {
    await db.collection('users').deleteMany({})
    await db.collection('users').insertMany(users)
  }

  // Create unique index on slug
  await db.collection('stores').createIndex({ slug: 1 }, { unique: true })
  await db.collection('users').createIndex({ email: 1 }, { unique: true })

  console.log('Successfully seeded MongoDB Atlas!')
  await client.close()
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
