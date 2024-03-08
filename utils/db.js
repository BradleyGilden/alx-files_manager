import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // constructor to set up DBCLient
    const HOST = process.env.DB_HOST || 'localhost';
    const PORT = process.env.DB_PORT || 27017;
    const DB_NAME = process.env.DB_DATABASE || 'files_manager';
    let URL = `mongodb://${HOST}:${PORT}`;
    if (process.env.MONGO_URI) {
      URL = process.env.MONGO_URI;
    }
    this.client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;
    this.usersCollection = null;
    this.filesCollection = null;
    this.client.connect()
      .then(() => {
        this.db = this.client.db(DB_NAME);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      }).catch((err) => {
        console.log(err);
      });
  }

  /**
   * isAlive - a health check for the client to see if it is connected
   * @returns {Boolean} true if connected, false otherwise
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * nbUsers - counts the number of entries in the user collection
   * @returns {Promise<Number>} number of users
   */
  async nbUsers() {
    const usersCount = await this.usersCollection.countDocuments();
    return usersCount;
  }

  /**
   * nbUsers - counts the number of entries in the files collection
   * @returns {Promise<Number>} number of files
   */
  async nbFiles() {
    const filesCount = await this.filesCollection.countDocuments();
    return filesCount;
  }
}
const dbClient = new DBClient();
export default dbClient;
