const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://akashk79026_db_user:Storecraft2026@cluster0.8pscyrl.mongodb.net/storecraft?retryWrites=true&w=majority&appName=Cluster0';
async function fixSize() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('storecraft');
  const stores = await db.collection('stores').find({}).toArray();
  for (const store of stores) {
    let modified = false;
    for (const p of store.products || []) {
      for (let i = 0; i < (p.images || []).length; i++) {
        if (p.images[i].startsWith('data:image/') && p.images[i].length > 100000) {
          console.log('Fixing large image in ' + store.slug);
          p.images[i] = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
          modified = true;
        }
      }
    }
    if (modified) {
      await db.collection('stores').updateOne({ _id: store._id }, { $set: { products: store.products } });
    }
  }
  await client.close();
}
fixSize().catch(console.error);
