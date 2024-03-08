// This file contains all the file handlers
import { join } from 'path';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { v4 as uuid4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// handles uploading of media to the server
const postUpload = async (req, res) => {
  const token = req.headers['x-token'];

  // get user id stored in redis
  const userToken = await redisClient.get(`auth_${token}`);
  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });

  // get user from the database
  const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userToken) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const DOCTYPES = ['folder', 'file', 'image'];

  // getting data from request body
  const { name, type, data } = req.body;
  let { parentId, isPublic } = req.body;

  // setting defaults
  parentId = parentId === '0' || !parentId ? 0 : parentId;
  isPublic = isPublic === undefined ? false : isPublic;

  // check mandatory fields
  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (!type || !DOCTYPES.includes(type)) return res.status(400).json({ error: 'Missing type' });
  if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

  // if parentId is given, then fetch document
  if (parentId) {
    const doc = await dbClient.filesCollection.findOne({ _id: ObjectId(parentId) });
    if (!doc) return res.status(400).json({ error: 'Parent not found' });
    if (doc.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
  }

  const docInit = {
    userId: user._id,
    name,
    type,
    isPublic,
    parentId,
  };

  if (type === 'folder') {
    const createdDoc = await dbClient.filesCollection.insertOne(docInit);
    return res.status(201).json({
      id: createdDoc.insertedId,
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    });
  }
  // absolute path of the folder in which the file is stored
  let pathDir = process.env.FOLDER_PATH || '/tmp/files_manager';
  // ensure it is a valid directory with no extra '/'
  pathDir = join(pathDir);
  const localPath = join(`${pathDir}/${uuid4()}`);
  // get binary data from base64 input to write to image or text files
  const buffer = Buffer.from(data, 'base64');
  try {
    await fs.promises.mkdir(pathDir, { recursive: true });
    await fs.promises.writeFile(localPath, buffer);
  } catch (err) {
    return res.status(400).json({ error: String(err) });
  }
  // assign localPath with the files absolute path
  docInit.localPath = localPath;
  const createdDoc = await dbClient.filesCollection.insertOne(docInit);
  return res.status(201).json({
    id: createdDoc.insertedId,
    userId: user._id,
    name,
    type,
    isPublic,
    parentId,
  });
};

export default {
  postUpload,
};
