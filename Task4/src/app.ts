import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dataRoutes from './routes/dataRoutes';

dotenv.config();

const app = express();

//  CORS setting
app.use(cors({
  origin: 'http://localhost:3000', // Thay thế bằng nguồn gốc của bạn
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

// route configuration
app.use('/getProcessedData', dataRoutes);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
