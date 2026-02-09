const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const logger = require('./utils/logger');
const morgan = require('morgan');
// const { User, EmployeeMaster, EmployeeRecord, PreJoiningForm, PostJoiningForm } = require('./models/index');

const app = express();
const PORT = process.env.APP_PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
// Morgan middleware to log HTTP requests
// Morgan middleware to log HTTP requests
// Morgan middleware to log HTTP requests
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { 
  stream: logger.stream,
  skip: (req, res) => res.statusCode < 400 // Skip successful requests (2xx, 3xx) in ALL environments
}));

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const emailRoutes = require('./routes/emailRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const formRoutes = require('./routes/formRoutes');
const documentRoutes = require('./routes/documentRoutes');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/documents', documentRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is running for the Onboarding Portal...');
});

// Explicit health check for Nginx proxied path
app.get('/api', (req, res) => {
  res.send('API is running for the Onboarding Portal...');
});

// Database Sync and Server Start
const startServer = async () => {
  // Critical Environment Variable Check
  const requiredEnvVars = [
    'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST',
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error('CRITICAL ERROR: Missing required environment variables: %o', missingEnvVars);
    console.error('CRITICAL ERROR: Missing required environment variables:', missingEnvVars); // Keep console for immediate feedback if logger fails
    process.exit(1);
  }

  try {
    logger.info('Attempting to connect to database...');
    // Authenticate DB
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    logger.info('Syncing models...');
    // Sync Models
    await sequelize.sync({ alter: false }); 
    logger.info('Database synchronized. All tables created.');

    // Global Error Handler Middleware
    app.use((err, req, res, next) => {
      logger.error('Unhandled Error: %o', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
    
    // Graceful Shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
        });
    });

  } catch (error) {
    logger.error('Unable to connect to the database: %o', error);
    process.exit(1); 
  }
};

startServer();

// Global Crash Prevention
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully... %o', err);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 %o', err);
});
