const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const { User } = require('./models/User'); // Import User separately if needed, or from index if consolidated
const { EmployeeMaster, EmployeeRecord, PreJoiningForm, PostJoiningForm } = require('./models/index');

const app = express();
const PORT = process.env.APP_PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const emailRoutes = require('./routes/emailRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/employees', employeeRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Database Sync and Server Start
const startServer = async () => {
  try {
    // Authenticate DB
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync Models (FORCE: TRUE to drop and recreate tables as requested)
    // defined models: User is defined in separate file but imported in index.js for associations? 
    // Wait, in models/index.js I required User.js.
    // sequelize.sync will sync all models defined on the sequelize instance.
    
    await sequelize.sync({ alter: true }); 
    console.log('Database synchronized. All tables created.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
