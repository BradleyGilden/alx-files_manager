// This file contains all the file handlers
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// handles uploading of media to the server
const postUpload = async (req, res) => {
  const token = req.headers['x-token'];
  const userToken = await redisClient.get(`auth_${token}`);

  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });

  const DOCTYPES = ['folder', 'file', 'image'];

  const {
    name, type, parentId, isPublic, data,
  } = req.body;

  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (!type || !DOCTYPES.includes(type)) {
    return res.status(400).json({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    return res.status(400).json({ error: 'Missing data' });
  }

  if (parentId !== undefined) {
    const doc = await dbClient.filesCollection.findOne({ parentId });
    if (!doc) return res.status(400).json({ error: 'Parent not found' });
    if (doc.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
  }
  if (type === 'folder') {
    dbClient.insertOne
  }
};
