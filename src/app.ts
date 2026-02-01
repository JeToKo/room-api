import express from 'express';
import reservationRouter from './routes/reservationRouter';

const app = express();

app.use(express.json());
const port = process.env.PORT || 3000;


app.use('/', reservationRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}


export default app;