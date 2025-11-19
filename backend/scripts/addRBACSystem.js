/**
 * ============================================
 * Migration: Add RBAC System (Roles, Permissions, Audit Logs)
 * ============================================
 * Adds role-based access control with audit logging
 */

require('dotenv').config();
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function addRBACSystem() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // =========================================
    // Step 1: Add role fields to users table
    // =========================================
    console.log('🔄 Adding role fields to users table...');

    await sequelize.query(`
      DO $$
      BEGIN
        -- Add role column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='role'
        ) THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';
          CREATE INDEX idx_users_role ON users(role);
        END IF;

        -- Add roleChangedAt column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='role_changed_at'
        ) THEN
          ALTER TABLE users ADD COLUMN role_changed_at TIMESTAMP;
        END IF;

        -- Add roleChangedBy column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='role_changed_by'
        ) THEN
          ALTER TABLE users ADD COLUMN role_changed_by INTEGER REFERENCES users(id);
        END IF;
      END $$;
    `);

    console.log('✅ Role fields added to users table\n');

    // =========================================
    // Step 2: Create permissions table
    // =========================================
    console.log('🔄 Creating permissions table...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
      CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
    `);

    console.log('✅ Permissions table created\n');

    // =========================================
    // Step 3: Create role_permissions table
    // =========================================
    console.log('🔄 Creating role_permissions table...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role VARCHAR(20) NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, permission)
      );

      CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
      CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission);
    `);

    console.log('✅ Role_permissions table created\n');

    // =========================================
    // Step 4: Create audit_logs table
    // =========================================
    console.log('🔄 Creating audit_logs table...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(50) NOT NULL,
        resource_id INTEGER,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
    `);

    console.log('✅ Audit_logs table created\n');

    // =========================================
    // Step 5: Seed permissions
    // =========================================
    console.log('🔄 Seeding permissions...');

    const permissions = [
      // Course permissions
      { name: 'courses.view.published', description: 'View published courses', category: 'courses' },
      { name: 'courses.view.unpublished', description: 'View unpublished courses', category: 'courses' },
      { name: 'courses.create', description: 'Create new courses', category: 'courses' },
      { name: 'courses.edit.own', description: 'Edit own courses', category: 'courses' },
      { name: 'courses.edit.any', description: 'Edit any course', category: 'courses' },
      { name: 'courses.delete.own', description: 'Delete own courses', category: 'courses' },
      { name: 'courses.delete.any', description: 'Delete any course', category: 'courses' },
      { name: 'courses.publish', description: 'Publish/unpublish courses', category: 'courses' },

      // Card permissions
      { name: 'cards.view.own', description: 'View own cards', category: 'cards' },
      { name: 'cards.view.templates', description: 'View card templates', category: 'cards' },
      { name: 'cards.create', description: 'Create new cards', category: 'cards' },
      { name: 'cards.edit.own', description: 'Edit own cards', category: 'cards' },
      { name: 'cards.edit.templates', description: 'Edit card templates', category: 'cards' },
      { name: 'cards.delete.own', description: 'Delete own cards', category: 'cards' },
      { name: 'cards.delete.any', description: 'Delete any card', category: 'cards' },

      // User permissions
      { name: 'users.view.own', description: 'View own profile', category: 'users' },
      { name: 'users.view.all', description: 'View all users', category: 'users' },
      { name: 'users.edit.own', description: 'Edit own profile', category: 'users' },
      { name: 'users.edit.any', description: 'Edit any user', category: 'users' },
      { name: 'users.delete', description: 'Delete users permanently', category: 'users' },
      { name: 'users.change_role.student', description: 'Change user to student role', category: 'users' },
      { name: 'users.change_role.teacher', description: 'Change user to teacher role', category: 'users' },
      { name: 'users.change_role.admin', description: 'Change user to admin role', category: 'users' },
      { name: 'users.deactivate', description: 'Deactivate/activate users', category: 'users' },

      // Achievement permissions
      { name: 'achievements.view', description: 'View achievements', category: 'achievements' },
      { name: 'achievements.create', description: 'Create achievements', category: 'achievements' },
      { name: 'achievements.edit', description: 'Edit achievements', category: 'achievements' },
      { name: 'achievements.delete', description: 'Delete achievements', category: 'achievements' },

      // System permissions
      { name: 'audit_logs.view.own', description: 'View own audit logs', category: 'system' },
      { name: 'audit_logs.view.all', description: 'View all audit logs', category: 'system' },
      { name: 'stats.view.own', description: 'View own statistics', category: 'system' },
      { name: 'stats.view.course', description: 'View course statistics', category: 'system' },
      { name: 'stats.view.platform', description: 'View platform-wide statistics', category: 'system' },
      { name: 'system.settings', description: 'Manage system settings', category: 'system' }
    ];

    for (const perm of permissions) {
      await sequelize.query(`
        INSERT INTO permissions (name, description, category)
        VALUES (:name, :description, :category)
        ON CONFLICT (name) DO NOTHING
      `, {
        replacements: perm
      });
    }

    console.log(`✅ ${permissions.length} permissions seeded\n`);

    // =========================================
    // Step 6: Assign permissions to roles
    // =========================================
    console.log('🔄 Assigning permissions to roles...');

    const rolePermissions = {
      student: [
        'courses.view.published',
        'cards.view.own',
        'cards.edit.own',
        'users.view.own',
        'users.edit.own',
        'achievements.view',
        'stats.view.own'
      ],
      teacher: [
        // All student permissions
        'courses.view.published',
        'cards.view.own',
        'cards.edit.own',
        'users.view.own',
        'users.edit.own',
        'achievements.view',
        'stats.view.own',
        // Plus teacher-specific
        'courses.view.unpublished',
        'courses.create',
        'courses.edit.own',
        'courses.delete.own',
        'courses.publish',
        'cards.view.templates',
        'cards.create',
        'cards.edit.templates',
        'cards.delete.own',
        'audit_logs.view.own',
        'stats.view.course'
      ],
      admin: [
        // All teacher permissions
        'courses.view.published',
        'courses.view.unpublished',
        'courses.create',
        'courses.edit.own',
        'courses.delete.own',
        'courses.publish',
        'cards.view.own',
        'cards.view.templates',
        'cards.create',
        'cards.edit.own',
        'cards.edit.templates',
        'cards.delete.own',
        'users.view.own',
        'users.edit.own',
        'achievements.view',
        'audit_logs.view.own',
        'stats.view.own',
        'stats.view.course',
        // Plus admin-specific
        'courses.edit.any',
        'courses.delete.any',
        'cards.delete.any',
        'users.view.all',
        'users.edit.any',
        'users.change_role.student',
        'users.change_role.teacher',
        'users.deactivate',
        'achievements.create',
        'achievements.edit',
        'audit_logs.view.all',
        'stats.view.platform'
      ],
      super_admin: [
        // All permissions - just add everything
        'courses.view.published',
        'courses.view.unpublished',
        'courses.create',
        'courses.edit.own',
        'courses.edit.any',
        'courses.delete.own',
        'courses.delete.any',
        'courses.publish',
        'cards.view.own',
        'cards.view.templates',
        'cards.create',
        'cards.edit.own',
        'cards.edit.templates',
        'cards.delete.own',
        'cards.delete.any',
        'users.view.own',
        'users.view.all',
        'users.edit.own',
        'users.edit.any',
        'users.delete',
        'users.change_role.student',
        'users.change_role.teacher',
        'users.change_role.admin',
        'users.deactivate',
        'achievements.view',
        'achievements.create',
        'achievements.edit',
        'achievements.delete',
        'audit_logs.view.own',
        'audit_logs.view.all',
        'stats.view.own',
        'stats.view.course',
        'stats.view.platform',
        'system.settings'
      ]
    };

    for (const [role, perms] of Object.entries(rolePermissions)) {
      for (const perm of perms) {
        await sequelize.query(`
          INSERT INTO role_permissions (role, permission)
          VALUES (:role, :permission)
          ON CONFLICT (role, permission) DO NOTHING
        `, {
          replacements: { role, permission: perm }
        });
      }
      console.log(`  ✅ Assigned ${perms.length} permissions to ${role}`);
    }

    console.log('✅ Permissions assigned to roles\n');

    // =========================================
    // Step 7: Update existing users to 'student' role
    // =========================================
    console.log('🔄 Updating existing users to student role...');

    const [updateResult] = await sequelize.query(`
      UPDATE users SET role = 'student' WHERE role IS NULL
    `);

    console.log(`✅ Updated existing users to student role\n`);

    // =========================================
    // Final Summary
    // =========================================
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ RBAC Migration Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('📋 Summary:');
    console.log('  ✓ Role fields added to users table');
    console.log('  ✓ Permissions table created');
    console.log('  ✓ Role_permissions table created');
    console.log('  ✓ Audit_logs table created');
    console.log(`  ✓ ${permissions.length} permissions seeded`);
    console.log('  ✓ Permissions assigned to 4 roles');
    console.log('  ✓ Existing users set to student role');
    console.log('');
    console.log('🔐 Roles created:');
    console.log('  - student: Basic learning access');
    console.log('  - teacher: Course creation & management');
    console.log('  - admin: User & content management');
    console.log('  - super_admin: Full system access');
    console.log('');
    console.log('⚠️  Next Steps:');
    console.log('  1. Run seedSuperAdmin.js to create a super admin user');
    console.log('  2. Update backend routes with RBAC middleware');
    console.log('  3. Test permission checks');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addRBACSystem();
