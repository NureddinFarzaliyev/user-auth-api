import express from 'express';
import 'dotenv/config';
import connectDB from './db/connect.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';

// Import Middleware
import { requireAuth, checkUser } from './middlewares/authMiddleware.js';

// Port
const port = process.env.PORT || 3000

// App
const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
}));

// Routes
app.get('*', checkUser)
app.use('/auth', authRoutes)
app.get('/', requireAuth, (req, res) => res.send('Hello World!' + req.userId))

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
};
  
startServer();