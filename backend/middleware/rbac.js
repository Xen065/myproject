/**
 * ============================================
 * RBAC Middleware
 * ============================================
 * Role-Based Access Control middleware for protecting routes
 */

const { RolePermission } = require('../models');

// Cache for role permissions (refreshed every 5 minutes)
let permissionCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load permissions for all roles into cache
 */
async function loadPermissions() {
  const now = Date.now();

  // Return cached permissions if still fresh
  if (now - cacheTimestamp < CACHE_DURATION && Object.keys(permissionCache).length > 0) {
    return permissionCache;
  }

  // Fetch all role permissions from database
  const rolePermissions = await RolePermission.findAll();

  // Build cache object
  permissionCache = {
    student: [],
    teacher: [],
    admin: [],
    super_admin: []
  };

  rolePermissions.forEach(rp => {
    if (permissionCache[rp.role]) {
      permissionCache[rp.role].push(rp.permission);
    }
  });

  cacheTimestamp = now;
  return permissionCache;
}

/**
 * Check if user has specific role(s)
 * @param {string|string[]} allowedRoles - Role(s) required
 * @returns {Function} Express middleware
 */
function requireRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Convert single role to array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user has one of the allowed roles
      if (roles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: `One of: ${roles.join(', ')}`,
        current: req.user.role
      });

    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
}

/**
 * Check if user has specific permission
 * @param {string} requiredPermission - Permission required
 * @returns {Function} Express middleware
 */
function requirePermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Load permissions (from cache or DB)
      const permissions = await loadPermissions();
      const userPermissions = permissions[req.user.role] || [];

      // Check if user has the required permission
      if (userPermissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: requiredPermission,
        role: req.user.role
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
}

/**
 * Check if user has ANY of the specified permissions
 * @param {string[]} requiredPermissions - Array of permissions (needs at least one)
 * @returns {Function} Express middleware
 */
function requireAnyPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Load permissions
      const permissions = await loadPermissions();
      const userPermissions = permissions[req.user.role] || [];

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(perm =>
        userPermissions.includes(perm)
      );

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: `Any of: ${requiredPermissions.join(', ')}`,
        role: req.user.role
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
}

/**
 * Check if user owns the resource OR has admin permission
 * Used for edit/delete operations where users can modify their own content
 * or admins can modify any content
 *
 * @param {Function} getResourceOwnerId - Function that returns the owner ID from request
 * @param {string} adminPermission - Permission that bypasses ownership check
 * @returns {Function} Express middleware
 */
function requireOwnershipOrPermission(getResourceOwnerId, adminPermission) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Get the resource owner ID
      const ownerId = await getResourceOwnerId(req);

      // Check if user owns the resource
      if (ownerId === req.user.id) {
        return next();
      }

      // If not owner, check if user has admin permission
      const permissions = await loadPermissions();
      const userPermissions = permissions[req.user.role] || [];

      if (userPermissions.includes(adminPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: 'You can only modify your own resources or need admin permission'
      });

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
}

/**
 * Check if user is admin or super_admin
 * Shorthand for requireRole(['admin', 'super_admin'])
 */
function requireAdmin() {
  return requireRole(['admin', 'super_admin']);
}

/**
 * Check if user is super_admin
 * Shorthand for requireRole('super_admin')
 */
function requireSuperAdmin() {
  return requireRole('super_admin');
}

/**
 * Attach user permissions to request object
 * Useful for conditional rendering in routes
 */
function attachPermissions() {
  return async (req, res, next) => {
    try {
      if (req.user) {
        const permissions = await loadPermissions();
        req.userPermissions = permissions[req.user.role] || [];
      }
      next();
    } catch (error) {
      console.error('Error attaching permissions:', error);
      next(); // Continue anyway, just without permissions
    }
  };
}

/**
 * Utility function to check permission programmatically
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>}
 */
async function hasPermission(role, permission) {
  try {
    const permissions = await loadPermissions();
    const rolePermissions = permissions[role] || [];
    return rolePermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Clear permission cache (useful after role permission updates)
 */
function clearPermissionCache() {
  permissionCache = {};
  cacheTimestamp = 0;
}

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireOwnershipOrPermission,
  requireAdmin,
  requireSuperAdmin,
  attachPermissions,
  hasPermission,
  clearPermissionCache,
  loadPermissions
};
