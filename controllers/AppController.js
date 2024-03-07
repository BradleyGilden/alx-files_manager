// This file contains all the applications controllers
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getStatus = async (_req, res) => {
  if (dbClient.isAlive() && redisClient.isAlive()) {
    res.status(200).json({ redis: true, db: true });
  }
};

const getStats = async (_req, res) => {
  const fileCount = await dbClient.nbFiles;

};
