const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const { User, EmployeeMaster, EmployeeRecord, PreJoiningForm, PostJoiningForm } = require('./models/index');

const app = express();
const PORT = process.env.APP_PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

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
  try {
    console.log('Attempting to connect to database...');
    // Authenticate DB
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    console.log('Syncing models...');
    // Sync Models
    await sequelize.sync({ alter: false }); 
    console.log('Database synchronized. All tables created.');

    // Global Error Handler Middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled Error:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
    // Graceful Shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); 
  }
};

startServer();

// Global Crash Prevention
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  console.error(err.name, err.message, err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message, err.stack);
});
