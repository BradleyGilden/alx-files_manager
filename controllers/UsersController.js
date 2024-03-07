// This file contains all the user controllers
import sha1 from 'sha1';
import dbClient from '../utils/db';

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

export default {
  postNow,
};
