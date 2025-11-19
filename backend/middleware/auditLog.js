/**
 * ============================================
 * Audit Logging Middleware
 * ============================================
 * Automatically logs administrative actions for security and compliance
 */

const { AuditLog } = require('../models');

/**
 * Extract IP address from request
 * @param {Object} req - Express request
 * @returns {string} IP address
 */
function getIpAddress(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Extract User-Agent from request
 * @param {Object} req - Express request
 * @returns {string} User agent
 */
function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Create audit log entry
 * @param {Object} data - Audit log data
 * @returns {Promise<AuditLog>}
 */
async function createAuditLog(data) {
  try {
    return await AuditLog.create({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging shouldn't break the app
    return null;
  }
}

/**
 * Middleware to automatically log admin actions
 * Usage: router.post('/api/admin/courses', auth, auditLog('course.create', 'course'), ...)
 *
 * @param {string} action - Action being performed (e.g., 'course.create', 'user.update')
 * @param {string} resource - Resource type (e.g., 'course', 'user', 'card')
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
function auditLog(action, resource, options = {}) {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);

    // Override res.json to capture response
    res.json = function(data) {
      // Only log if action was successful and user is authenticated
      if (req.user && (res.statusCode >= 200 && res.statusCode < 300)) {
        // Get resource ID from different possible locations
        let resourceId = null;

        if (options.getResourceId) {
          // Custom function to get resource ID
          resourceId = options.getResourceId(req, data);
        } else if (data?.data?.id) {
          // From response data
          resourceId = data.data.id;
        } else if (data?.id) {
          // Direct from response
          resourceId = data.id;
        } else if (req.params.id) {
          // From URL params
          resourceId = parseInt(req.params.id);
        }

        // Build details object
        const details = {
          method: req.method,
          path: req.path,
          ...(options.includeBody && req.body ? { body: sanitizeBody(req.body) } : {}),
          ...(options.includeParams && req.params ? { params: req.params } : {}),
          ...(options.includeQuery && req.query ? { query: req.query } : {}),
          ...(options.details ? options.details : {})
        };

        // Create audit log asynchronously (don't wait)
        createAuditLog({
          userId: req.user.id,
          action,
          resource,
          resourceId,
          details,
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req)
        }).catch(err => {
          console.error('Failed to create audit log:', err);
        });
      }

      // Call original res.json
      return originalJson(data);
    };

    next();
  };
}

/**
 * Sanitize request body to remove sensitive fields
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeBody(body) {
  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Manual audit logging function for custom scenarios
 * @param {Object} req - Express request
 * @param {string} action - Action being performed
 * @param {string} resource - Resource type
 * @param {number} resourceId - Resource ID
 * @param {Object} details - Additional details
 * @returns {Promise<AuditLog>}
 */
async function logAction(req, action, resource, resourceId = null, details = {}) {
  if (!req.user) {
    console.warn('Attempted to log action without authenticated user');
    return null;
  }

  return await createAuditLog({
    userId: req.user.id,
    action,
    resource,
    resourceId,
    details: {
      ...details,
      method: req.method,
      path: req.path
    },
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });
}

/**
 * Middleware to log all requests (for debugging)
 * Use sparingly - generates a lot of logs
 */
function auditAllRequests() {
  return async (req, res, next) => {
    if (req.user) {
      console.log(`[AUDIT] ${req.user.username} (${req.user.role}) - ${req.method} ${req.path}`);
    }
    next();
  };
}

/**
 * Get audit logs for a specific user
 * @param {number} userId - User ID
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<Array>}
 */
async function getUserAuditLogs(userId, options = {}) {
  const { limit = 50, offset = 0, action = null, resource = null } = options;

  const where = { userId };
  if (action) where.action = action;
  if (resource) where.resource = resource;

  return await AuditLog.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{
      model: require('../models').User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'role']
    }]
  });
}

/**
 * Get recent audit logs (for admin dashboard)
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
async function getRecentAuditLogs(options = {}) {
  const {
    limit = 100,
    offset = 0,
    userId = null,
    action = null,
    resource = null,
    startDate = null,
    endDate = null
  } = options;

  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (resource) where.resource = resource;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = startDate;
    if (endDate) where.createdAt[Op.lte] = endDate;
  }

  return await AuditLog.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{
      model: require('../models').User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'role']
    }]
  });
}

/**
 * Get audit log statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
async function getAuditStats(options = {}) {
  const { startDate, endDate, userId } = options;
  const { Op } = require('sequelize');

  const where = {};
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = startDate;
    if (endDate) where.createdAt[Op.lte] = endDate;
  }

  const [totalLogs, actionCounts, resourceCounts] = await Promise.all([
    // Total logs
    AuditLog.count({ where }),

    // Count by action
    AuditLog.findAll({
      where,
      attributes: [
        'action',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['action'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    }),

    // Count by resource
    AuditLog.findAll({
      where,
      attributes: [
        'resource',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['resource'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    })
  ]);

  return {
    totalLogs,
    byAction: actionCounts.map(a => ({ action: a.action, count: parseInt(a.get('count')) })),
    byResource: resourceCounts.map(r => ({ resource: r.resource, count: parseInt(r.get('count')) }))
  };
}

module.exports = {
  auditLog,
  logAction,
  auditAllRequests,
  createAuditLog,
  getUserAuditLogs,
  getRecentAuditLogs,
  getAuditStats,
  getIpAddress,
  getUserAgent
};
