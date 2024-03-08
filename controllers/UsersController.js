// This file contains all the user controllers
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const postNow = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: 'Missing email' });
  if (!password) return res.status(400).json({ errror: 'Missing password' });

  const userExists = await dbClient.usersCollection.findOne({ email });
  if (userExists) return res.status(400).json({ error: 'Already exist' });
  // hass password
  const hPass = sha1(password);
  const user = await dbClient.usersCollection.insertOne({ email, password: hPass });
  return res.status(201).json({ id: user.insertedId, email });
};

const getMe = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userId) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  return res.status(200).json({ id: userId, email: user.email });
};

export default {
  postNow,
  getMe,
};
