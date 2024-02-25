import express, { Request, Response } from 'express';
import cors from 'cors';
import adminRouter from './routes/adminRoutes'
import userRouter from './routes/userRoutes'
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/admin',adminRouter);
app.use('/user',userRouter);




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
