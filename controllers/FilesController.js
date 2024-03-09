// This file contains all the file handlers
import { join } from 'path';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import { v4 as uuid4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// handles uploading of media to the server
const postUpload = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

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
  parentId = parentId === '0' || !parentId ? 0 : ObjectId(parentId);
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
      userId: String(user._id),
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
    userId: String(user._id),
    name,
    type,
    isPublic,
    parentId,
  });
};

// get file based on file id
const getShow = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { id: docId } = req.params;
  // get user id stored in redis
  const userToken = await redisClient.get(`auth_${token}`);
  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });

  // get user from the database
  const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userToken) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const doc = await dbClient.filesCollection.findOne({ _id: ObjectId(docId), userId: user._id });
  if (!doc) return res.status(404).json({ error: 'Not found' });

  return res.status(201).json({
    id: docId,
    userId: String(user._id),
    name: doc.name,
    type: doc.type,
    isPublic: doc.isPublic,
    parentId: String(doc.parentId),
  });
};

// get range of files via pagination based on search queries
const getIndex = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // getting search query parameters
  let { parentId, page } = req.query;
  // assigning defaults
  parentId = parentId || 0;
  page = page || 0;
  // get user id stored in redis
  const userToken = await redisClient.get(`auth_${token}`);
  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });

  // get user from the database
  const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userToken) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // get pagination data
  const aggregation = [{ $skip: page * 20 }, { $limit: 20 }];
  if (parentId !== 0) aggregation.unshift({ $match: { parentId: ObjectId(parentId) } });
  const docs = [];
  const aggroCursor = await dbClient.filesCollection.aggregate(aggregation);
  const docArray = await aggroCursor.toArray();
  docArray.forEach((doc) => {
    const filteredDoc = {
      id: String(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      type: doc.type,
      isPublic: doc.isPublic,
      parentId: doc.parentId,
    };
    docs.push(filteredDoc);
  });
  return res.status(200).json(docs);
};

const putPublish = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { id: docId } = req.params;
  // get user id stored in redis
  const userToken = await redisClient.get(`auth_${token}`);
  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });

  // get user from the database
  const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userToken) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const doc = await dbClient.filesCollection.findOne({ _id: ObjectId(docId), userId: user._id });
  if (!doc) return res.status(404).json({ error: 'Not found' });

  await dbClient.filesCollection.updateOne({ _id: ObjectId(docId) }, { $set: { isPublic: true } });

  return res.status(200).json({
    id: String(doc._id),
    userId: String(doc.userId),
    name: doc.name,
    type: doc.type,
    isPublic: true,
    parentId: doc.parentId,
  });
};

const putUnpublish = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { id: docId } = req.params;
  // get user id stored in redis
  const userToken = await redisClient.get(`auth_${token}`);
  if (!userToken) return res.status(401).json({ error: 'Unauthorized' });

  // get user from the database
  const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userToken) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const doc = await dbClient.filesCollection.findOne({ _id: ObjectId(docId), userId: user._id });
  if (!doc) return res.status(404).json({ error: 'Not found' });

  await dbClient.filesCollection.updateOne({ _id: ObjectId(docId) }, { $set: { isPublic: false } });

  return res.status(200).json({
    id: String(doc._id),
    userId: String(doc.userId),
    name: doc.name,
    type: doc.type,
    isPublic: false,
    parentId: doc.parentId,
  });
};

const getFile = async (req, res) => {
  const idFile = req.params.id || '';
  const size = req.query.size || 0;

  const fileDocument = await dbClient.filesCollection.findOne({ _id: ObjectId(idFile) });
  if (!fileDocument) return res.status(404).json({ error: 'Not found' });

  const { isPublic } = fileDocument;
  const { userId } = fileDocument;
  const { type } = fileDocument;

  let user = null;
  let owner = false;

  const token = req.header('X-Token') || null;
  if (token) {
    const redisToken = await redisClient.get(`auth_${token}`);
    if (redisToken) {
      user = await dbClient.usersCollection.findOne({ _id: ObjectId(redisToken) });
      if (user) owner = user._id.toString() === userId.toString();
    }
  }

  if (!isPublic && !owner) return res.status(404).json({ error: 'Not found' });
  if (['folder'].includes(type)) return res.status(400).json({ error: 'A folder doesn\'t have content' });

  const realPath = size === 0 ? fileDocument.localPath : `${fileDocument.localPath}_${size}`;

  try {
    const dataFile = await fs.promises.readFile(realPath);
    const mimeType = mime.contentType(fileDocument.name);
    res.setHeader('Content-Type', mimeType);
    return res.json(dataFile);
  } catch (error) {
    return res.status(404).json({ error: 'Not found' });
  }
};

export default {
  postUpload,
  getShow,
  getIndex,
  putPublish,
  putUnpublish,
  getFile,
};
