// npm run dev:memory — runs the API on a seeded in-memory MongoDB, for machines without mongod.
// Data is lost when the process stops.
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('./index')
const seed = require('./seed')

MongoMemoryServer.create()
  .then(m => mongoose.connect(m.getUri()))
  .then(seed)
  .then(() => {
    const port = process.env.PORT || 3001
    app.listen(port, () => console.log(`In-memory API on port ${port}`))
  })
