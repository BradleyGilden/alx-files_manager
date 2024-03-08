import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // constructor of the RedisClient class
    this.client = redis.createClient();
    this.client.on('error', (err) => console.log(err));
    this._get = promisify(this.client.get).bind(this.client);
    this._set = promisify(this.client.set).bind(this.client);
    this._del = promisify(this.client.del).bind(this.client);
  }

  /**
   * isAlive - a health check for the client to see if it is connected
   * @returns {Boolean} true if connected, false otherwise
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * get - implement get functionality in Redis server
   * @key key to access the value '@val'
   * @returns {Promise<String>} value of the key being accessed
   */
  async get(key) {
    try {
      const value = await this._get(key);
      return value;
    } catch (_err) {
      return null;
    }
  }

  /**
   * set - implement set functionality in Redis server
   * @key key to access the value '@val'
   * @val value to to be set
   * @ex expiration time of the key
   * @returns {Promise}
   */
  async set(key, val, ex) {
    try {
      await this._set(key, val, 'EX', ex);
    } catch (_err) {
      // do nothing
    }
  }

  /**
   * del - implement del (delete) functionality in Redis server
   * @key key of the value to delete
   * @returns {Promise}
   */
  async del(key) {
    try {
      await this._del(key);
    } catch (_err) {
      // do nothing
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
