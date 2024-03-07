const { MongoClient } = require('mongodb');

const URL = process.env.MONGO_URI;
const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(() => {
  const db = client.db('files_manager');
  const col = client.db('files');
  client.close();
}).catch((err) => {
  console.log(err);
});
