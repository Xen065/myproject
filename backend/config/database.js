/**
 * ============================================
 * Database Configuration (PostgreSQL + Sequelize)
 * ============================================
 * This file sets up the connection to PostgreSQL using Sequelize ORM.
 * Sequelize is a tool that makes it easy to work with databases using JavaScript.
 */

const { Sequelize } = require('sequelize');

// Create a new Sequelize instance with PostgreSQL connection
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // Database user
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',

    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    // Connection pool configuration
    pool: {
      max: 5,           // Maximum number of connections
      min: 0,           // Minimum number of connections
      acquire: 30000,   // Maximum time to get a connection (30 seconds)
      idle: 10000       // Maximum time a connection can be idle (10 seconds)
    },

    // Timezone
    timezone: '+00:00',

    // Define options
    define: {
      timestamps: true,        // Automatically add createdAt and updatedAt fields
      underscored: true,       // Use snake_case for column names
      freezeTableName: false,  // Allow Sequelize to pluralize table names
    }
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Export the sequelize instance
module.exports = sequelize;
