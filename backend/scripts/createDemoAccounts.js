/**
 * ============================================
 * Create Demo Accounts for All Roles
 * ============================================
 * Creates 4 demo accounts: super_admin, admin, teacher, student
 */

require('dotenv').config();
const { User } = require('../models');
const sequelize = require('../config/database');

async function createDemoAccounts() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🎭 Creating Demo Accounts for All Roles');
    console.log('═══════════════════════════════════════════');
    console.log('');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Define demo accounts
    const demoAccounts = [
      {
        username: 'superadmin',
        email: 'superadmin@demo.com',
        password: 'Super123!',
        fullName: 'Super Admin Demo',
        role: 'super_admin'
      },
      {
        username: 'admin',
        email: 'admin@demo.com',
        password: 'Admin123!',
        fullName: 'Admin Demo',
        role: 'admin'
      },
      {
        username: 'teacher',
        email: 'teacher@demo.com',
        password: 'Teacher123!',
        fullName: 'Teacher Demo',
        role: 'teacher'
      },
      {
        username: 'student',
        email: 'student@demo.com',
        password: 'Student123!',
        fullName: 'Student Demo',
        role: 'student'
      }
    ];

    console.log('🔄 Creating demo accounts...\n');

    const createdAccounts = [];

    for (const account of demoAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { username: account.username }
      });

      if (existingUser) {
        console.log(`⚠️  User "${account.username}" already exists - updating role to ${account.role}`);

        // Update existing user's role
        existingUser.role = account.role;
        existingUser.fullName = account.fullName;
        existingUser.isActive = true;
        existingUser.isEmailVerified = true;
        await existingUser.save();

        createdAccounts.push({
          ...account,
          id: existingUser.id,
          status: 'updated'
        });
      } else {
        console.log(`✨ Creating new user "${account.username}" with role: ${account.role}`);

        // Create new user
        const newUser = await User.create({
          username: account.username,
          email: account.email,
          password: account.password,
          fullName: account.fullName,
          role: account.role,
          isActive: true,
          isEmailVerified: true
        });

        createdAccounts.push({
          ...account,
          id: newUser.id,
          status: 'created'
        });
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Demo Accounts Ready!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('');

    // Display credentials in a nice table
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ SUPER ADMIN ACCOUNT                                             │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Username: superadmin                                            │');
    console.log('│ Password: Super123!                                             │');
    console.log('│ Email:    superadmin@demo.com                                   │');
    console.log('│                                                                 │');
    console.log('│ 🔓 Can do EVERYTHING:                                           │');
    console.log('│    ✓ Manage all courses and cards                              │');
    console.log('│    ✓ Promote users to any role (including admin)               │');
    console.log('│    ✓ Delete users permanently                                  │');
    console.log('│    ✓ View all audit logs                                       │');
    console.log('│    ✓ Access system settings                                    │');
    console.log('└─────────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN ACCOUNT                                                   │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Username: admin                                                 │');
    console.log('│ Password: Admin123!                                             │');
    console.log('│ Email:    admin@demo.com                                        │');
    console.log('│                                                                 │');
    console.log('│ 🔓 Can do:                                                      │');
    console.log('│    ✓ Manage ANY course and cards                               │');
    console.log('│    ✓ View all users                                            │');
    console.log('│    ✓ Change user roles (student ↔ teacher)                     │');
    console.log('│    ✓ Deactivate/activate users                                 │');
    console.log('│    ✓ View audit logs                                           │');
    console.log('│    ✓ Platform-wide statistics                                  │');
    console.log('└─────────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ TEACHER ACCOUNT                                                 │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Username: teacher                                               │');
    console.log('│ Password: Teacher123!                                           │');
    console.log('│ Email:    teacher@demo.com                                      │');
    console.log('│                                                                 │');
    console.log('│ 🔓 Can do:                                                      │');
    console.log('│    ✓ Create new courses                                        │');
    console.log('│    ✓ Edit/delete OWN courses                                   │');
    console.log('│    ✓ Create/edit flashcards for OWN courses                    │');
    console.log('│    ✓ Publish/unpublish OWN courses                             │');
    console.log('│    ✓ View enrollment stats for OWN courses                     │');
    console.log('│    ✓ Access admin dashboard (/admin)                           │');
    console.log('└─────────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ STUDENT ACCOUNT                                                 │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Username: student                                               │');
    console.log('│ Password: Student123!                                           │');
    console.log('│ Email:    student@demo.com                                      │');
    console.log('│                                                                 │');
    console.log('│ 🔓 Can do:                                                      │');
    console.log('│    ✓ Enroll in published courses                               │');
    console.log('│    ✓ Study flashcards                                          │');
    console.log('│    ✓ Track personal progress                                   │');
    console.log('│    ✓ Earn achievements                                         │');
    console.log('│    ✓ View own statistics                                       │');
    console.log('└─────────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('🎯 QUICK START:');
    console.log('');
    console.log('1. Start the backend server:');
    console.log('   cd backend && npm start');
    console.log('');
    console.log('2. Start the frontend:');
    console.log('   cd frontend && npm start');
    console.log('');
    console.log('3. Login at: http://localhost:3000/login');
    console.log('');
    console.log('4. Try each account to see different permissions!');
    console.log('');
    console.log('📊 ADMIN DASHBOARD:');
    console.log('   Login as teacher/admin/superadmin and visit:');
    console.log('   http://localhost:3000/admin');
    console.log('');
    console.log('💡 TIP: Try logging in with different accounts in different');
    console.log('   browser tabs (or incognito mode) to compare permissions!');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating demo accounts:', error);
    process.exit(1);
  }
}

createDemoAccounts();
