const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const Customer = require('./models/Customer');
const { seedDatabase } = require('./seeds/seedData');

const PORT = process.env.PORT || 5000;

// Connect to Database & Auto-Seed if empty
connectDB().then(async () => {
  try {
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('Database is empty. Automatically initializing demo data...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Error during auto-seed check:', err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 FinSight 360 Backend API Server Running`);
    console.log(`📍 Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Demo RM Login: rm@finsight.demo / Demo@123`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
  });
});
