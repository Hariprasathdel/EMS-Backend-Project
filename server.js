// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(compression());

// ---------- API Routes ----------
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

apiRouter.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ]);
});

apiRouter.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  console.log('Contact form:', { name, email, message });
  res.json({ success: true, message: 'Thank you for contacting us!' });
});

app.use('/api', apiRouter);
app.use('/api', routes);

// ---------- Serve React App ----------
app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
