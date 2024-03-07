// This file contains all the base applications controllers
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getStatus = async (_req, res) => {
  if (dbClient.isAlive() && redisClient.isAlive()) {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }
};

const getStats = async (_req, res) => {
  const fileCount = await dbClient.nbFiles();
  const userCount = await dbClient.nbUsers();
  res.status(200).json({ users: userCount, files: fileCount });
};

export default {
  getStatus,
  getStats,
};
