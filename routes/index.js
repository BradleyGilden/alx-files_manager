import express from 'express';

let getStatus;
let getStats;
const baseRouter = express.Router();

baseRouter.get('/status', getStatus);
baseRouter.get('/stats', getStats);
