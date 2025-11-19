/**
 * ============================================
 * Admin Permission Routes
 * ============================================
 * Routes for managing permissions and role permissions
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requireSuperAdmin } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/auditLog');
const { Permission, RolePermission } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/permissions
 * @desc    Get all permissions
 * @access  Super Admin
 */
router.get(
  '/',
  protect,
  requireSuperAdmin(),
  async (req, res) => {
    try {
      const permissions = await Permission.findAll({
        order: [['category', 'ASC'], ['name', 'ASC']]
      });

      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching permissions'
      });
    }
  }
);

/**
 * @route   GET /api/admin/permissions/roles
 * @desc    Get all role permissions (organized by role)
 * @access  Super Admin
 */
router.get(
  '/roles',
  protect,
  requireSuperAdmin(),
  async (req, res) => {
    try {
      const rolePermissions = await RolePermission.findAll({
        order: [['role', 'ASC']]
      });

      // Organize by role
      const byRole = {
        student: [],
        teacher: [],
        admin: [],
        super_admin: []
      };

      rolePermissions.forEach(rp => {
        byRole[rp.role].push(rp.permission);
      });

      res.json({
        success: true,
        data: byRole
      });
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching role permissions'
      });
    }
  }
);

/**
 * @route   GET /api/admin/permissions/roles/:role
 * @desc    Get permissions for a specific role
 * @access  Super Admin
 */
router.get(
  '/roles/:role',
  protect,
  requireSuperAdmin(),
  async (req, res) => {
    try {
      const { role } = req.params;

      if (!['student', 'teacher', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      const rolePermissions = await RolePermission.findAll({
        where: { role },
        order: [['permission', 'ASC']]
      });

      const permissions = rolePermissions.map(rp => rp.permission);

      res.json({
        success: true,
        data: {
          role,
          permissions,
          count: permissions.length
        }
      });
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching role permissions'
      });
    }
  }
);

/**
 * @route   POST /api/admin/permissions/grant
 * @desc    Grant a permission to a role
 * @access  Super Admin
 */
router.post(
  '/grant',
  protect,
  requireSuperAdmin(),
  auditLog('permission.grant', 'system', { includeBody: true }),
  async (req, res) => {
    try {
      const { role, permission } = req.body;

      if (!role || !permission) {
        return res.status(400).json({
          success: false,
          error: 'Role and permission are required'
        });
      }

      if (!['student', 'teacher', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      // Check if permission exists
      const permissionExists = await Permission.findOne({
        where: { name: permission }
      });

      if (!permissionExists) {
        return res.status(404).json({
          success: false,
          error: 'Permission not found'
        });
      }

      // Check if already granted
      const existing = await RolePermission.findOne({
        where: { role, permission }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Permission already granted to this role'
        });
      }

      // Grant permission
      await RolePermission.create({
        role,
        permission
      });

      res.json({
        success: true,
        message: `Permission '${permission}' granted to '${role}'`,
        data: {
          role,
          permission
        }
      });
    } catch (error) {
      console.error('Error granting permission:', error);
      res.status(500).json({
        success: false,
        error: 'Error granting permission'
      });
    }
  }
);

/**
 * @route   POST /api/admin/permissions/revoke
 * @desc    Revoke a permission from a role
 * @access  Super Admin
 */
router.post(
  '/revoke',
  protect,
  requireSuperAdmin(),
  auditLog('permission.revoke', 'system', { includeBody: true }),
  async (req, res) => {
    try {
      const { role, permission } = req.body;

      if (!role || !permission) {
        return res.status(400).json({
          success: false,
          error: 'Role and permission are required'
        });
      }

      if (!['student', 'teacher', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      // Find and delete the role permission
      const deleted = await RolePermission.destroy({
        where: { role, permission }
      });

      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          error: 'Permission not found for this role'
        });
      }

      res.json({
        success: true,
        message: `Permission '${permission}' revoked from '${role}'`,
        data: {
          role,
          permission
        }
      });
    } catch (error) {
      console.error('Error revoking permission:', error);
      res.status(500).json({
        success: false,
        error: 'Error revoking permission'
      });
    }
  }
);

/**
 * @route   POST /api/admin/permissions/bulk-grant
 * @desc    Grant multiple permissions to a role
 * @access  Super Admin
 */
router.post(
  '/bulk-grant',
  protect,
  requireSuperAdmin(),
  auditLog('permission.bulk_grant', 'system', { includeBody: true }),
  async (req, res) => {
    try {
      const { role, permissions } = req.body;

      if (!role || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          error: 'Role and permissions array are required'
        });
      }

      if (!['student', 'teacher', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      const granted = [];
      const skipped = [];

      for (const permission of permissions) {
        // Check if already granted
        const existing = await RolePermission.findOne({
          where: { role, permission }
        });

        if (existing) {
          skipped.push(permission);
        } else {
          await RolePermission.create({ role, permission });
          granted.push(permission);
        }
      }

      res.json({
        success: true,
        message: `Granted ${granted.length} permissions to '${role}'`,
        data: {
          role,
          granted,
          skipped,
          total: granted.length
        }
      });
    } catch (error) {
      console.error('Error bulk granting permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error bulk granting permissions'
      });
    }
  }
);

/**
 * @route   GET /api/admin/permissions/matrix
 * @desc    Get permission matrix (all roles × all permissions)
 * @access  Super Admin
 */
router.get(
  '/matrix',
  protect,
  requireSuperAdmin(),
  async (req, res) => {
    try {
      const [permissions, rolePermissions] = await Promise.all([
        Permission.findAll({
          order: [['category', 'ASC'], ['name', 'ASC']]
        }),
        RolePermission.findAll()
      ]);

      // Build permission matrix
      const matrix = {
        student: {},
        teacher: {},
        admin: {},
        super_admin: {}
      };

      // Initialize all permissions as false
      permissions.forEach(p => {
        matrix.student[p.name] = false;
        matrix.teacher[p.name] = false;
        matrix.admin[p.name] = false;
        matrix.super_admin[p.name] = false;
      });

      // Mark granted permissions as true
      rolePermissions.forEach(rp => {
        if (matrix[rp.role]) {
          matrix[rp.role][rp.permission] = true;
        }
      });

      res.json({
        success: true,
        data: {
          permissions: permissions.map(p => ({
            name: p.name,
            description: p.description,
            category: p.category
          })),
          matrix
        }
      });
    } catch (error) {
      console.error('Error fetching permission matrix:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching permission matrix'
      });
    }
  }
);

module.exports = router;
