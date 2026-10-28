require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(compression());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.use('/api', routes);

app.use(express.static(path.join(__dirname, 'build')));
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exitCode = 1;
  }
};

startServer();
