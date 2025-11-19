/**
 * ============================================
 * Seed Script: Create Super Admin User
 * ============================================
 * Creates an initial super_admin user for system management
 */

require('dotenv').config();
const readline = require('readline');
const { User } = require('../models');
const sequelize = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function seedSuperAdmin() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🔐 Super Admin User Creation');
    console.log('═══════════════════════════════════════════');
    console.log('');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({
      where: { role: 'super_admin' }
    });

    if (existingSuperAdmin) {
      console.log('⚠️  A super admin user already exists:');
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log('');

      const proceed = await question('Do you want to create another super admin? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('\n❌ Operation cancelled');
        rl.close();
        process.exit(0);
      }
      console.log('');
    }

    // Collect user information
    console.log('Please provide super admin details:\n');

    const username = await question('Username (min 3 characters): ');
    if (!username || username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      rl.close();
      process.exit(1);
    }

    // Check if username exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      console.error('❌ Username already exists');
      rl.close();
      process.exit(1);
    }

    const email = await question('Email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      rl.close();
      process.exit(1);
    }

    // Check if email exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      console.error('❌ Email already exists');
      rl.close();
      process.exit(1);
    }

    const password = await question('Password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      rl.close();
      process.exit(1);
    }

    const fullName = await question('Full Name (optional): ');

    console.log('');

    // Create super admin user
    const superAdmin = await User.create({
      username,
      email,
      password,
      fullName: fullName || 'Super Administrator',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true
    });

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Super Admin User Created Successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('📋 User Details:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Full Name: ${superAdmin.fullName}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log('');
    console.log('🔒 Login Credentials:');
    console.log(`   Username/Email: ${superAdmin.username} or ${superAdmin.email}`);
    console.log(`   Password: [as entered]`);
    console.log('');
    console.log('⚠️  Important:');
    console.log('   - Store these credentials securely');
    console.log('   - Change the password after first login');
    console.log('   - Super admins have full system access');
    console.log('');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Handle readline close
rl.on('close', () => {
  process.exit(0);
});

seedSuperAdmin();
