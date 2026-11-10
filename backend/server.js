const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { authLimiter, withdrawalLimiter, verificationLimiter } = require('./middleware/rateLimitMiddleware');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const withdrawalRoutes = require('./routes/withdrawal');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const supportRoutes = require('./routes/support');

// Finding #3: Apply rate limiters consistently in server.js
// verificationLimiter is more restrictive and applied to specific endpoint via route-level middleware in auth.js
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/withdrawal', withdrawalLimiter, withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Earning Platform Backend is running successfully!' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/earning_platform';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully! 🍃');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
