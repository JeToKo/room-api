import express from 'express';
import reservationRouter from './routes/reservation';

const app = express();

app.use(express.json());
const port = process.env.PORT || 3000;


// Use reservation routes
app.use('/', reservationRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


export default app;