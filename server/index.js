import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './database/connect_db.js';
import userRouter from './routers/userRoutes.js';
import diveRouter from './routers/diveRoutes.js';


const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();
// app.use('/', userRouter);
app.use('/user', userRouter);
app.use('/dive', diveRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});