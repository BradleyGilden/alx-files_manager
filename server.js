import express from 'express';
import baseRouter from './routes';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use('/', baseRouter);

app.listen(PORT);
