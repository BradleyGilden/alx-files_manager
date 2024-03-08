// This file contains all the auth controllers
import sha1 from 'sha1';
import { v4 as uuid4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Connect user to session via redis client
const getConnect = async (req, res) => {
  const base64String = req.headers.authorization.slice(6);
  // decoding base64 string
  const buffer = Buffer.from(base64String, 'base64');
  const [email, password] = buffer.toString().split(':', 2);
  const hPass = sha1(password);

  const user = await dbClient.usersCollection.findOne({ email, password: hPass });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // generate token
  const token = uuid4();
  // store token in redis client
  await redisClient.set(`auth_${token}`, String(user._id), 24 * 60 * 60);
  return res.status(200).json({ token });
};

const getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  await redisClient.del(`auth_${token}`);

  return res.sendStatus(204);
};

export default {
  getConnect,
  getDisconnect,
};
