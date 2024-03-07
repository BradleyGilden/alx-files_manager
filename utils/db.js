import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // constructor to set up DBCLient
    const HOST = process.env.DB_HOST || 'localhost';
    const PORT = process.env.DB_PORT || 27017;
    const DB_NAME = process.env.DB_DATABASE || 'files_manager';
    const URL = `mongodb://${HOST}:${PORT}`;
    // if (process.env.MONGO_URI) {
    //   URL = process.env.MONGO_URI;
    // }
    this.client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;
    this.client.connect()
      .then(() => {
        this.db = this.client.db(DB_NAME);
      }).catch((err) => {
        console.log(err);
      });
  }

  /**
   * isAlive - a health check for the client to see if it is connected
   * @returns {boolean} - true if connected, false otherwise
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * nbUsers - counts the number of entries in the user collection
   * @returns {Number} - number of users
   */
  async nbUsers() {
    const users = this.db.collection('users');
    const usersCount = await users.countDocuments();
    return usersCount;
  }

  /**
   * nbUsers - counts the number of entries in the files collection
   * @returns {Number} - number of files
   */
  async nbFiles() {
    const files = this.db.collection('files');
    const filesCount = await files.countDocuments();
    return filesCount;
  }
}
const dbClient = new DBClient();
export default dbClient;
