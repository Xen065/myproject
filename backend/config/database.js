/**
 * ============================================
 * Database Configuration (PostgreSQL + Sequelize)
 * ============================================
 * This file sets up the connection to PostgreSQL using Sequelize ORM.
 * Sequelize is a tool that makes it easy to work with databases using JavaScript.
 */

const { Sequelize } = require('sequelize');

// Create a new Sequelize instance with PostgreSQL connection
// Support both DATABASE_URL (Render/Heroku style) and individual credentials
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      timezone: '+00:00',
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: false,
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        timezone: '+00:00',
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: false,
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
