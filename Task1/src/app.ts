import express from 'express';
import cors from 'cors';
import fileRoutes from './routes/fileRoutes';
import totalRoutes from './routes/getTotalRoutes';
import dotenv from 'dotenv';

// using env variables
dotenv.config();

const app = express();

//  CORS setting
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

// Middleware
app.use(express.json());

// Routes
app.use('/upload', fileRoutes);
app.use('/getTotal', totalRoutes);

// starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
