/**
 * ============================================
 * Admin Audit Log Routes
 * ============================================
 * Admin routes for viewing and analyzing audit logs
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { AuditLog, User } = require('../../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs with filters
 * @access  Admin
 */
router.get(
  '/',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const {
        userId,
        action,
        resource,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = req.query;

      const where = {};

      // Filter by user
      if (userId) {
        where.userId = parseInt(userId);
      }

      // Filter by action
      if (action) {
        where.action = action;
      }

      // Filter by resource
      if (resource) {
        where.resource = resource;
      }

      // Filter by date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const logs = await AuditLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'role']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          logs: logs.rows,
          total: logs.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching audit logs'
      });
    }
  }
);

/**
 * @route   GET /api/admin/audit-logs/:id
 * @desc    Get single audit log detail
 * @access  Admin
 */
router.get(
  '/:id',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const log = await AuditLog.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'role']
          }
        ]
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          error: 'Audit log not found'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Error fetching audit log:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching audit log'
      });
    }
  }
);

/**
 * @route   GET /api/admin/audit-logs/stats/summary
 * @desc    Get audit log statistics
 * @access  Admin
 */
router.get(
  '/stats/summary',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const { startDate, endDate, userId } = req.query;
      const sequelize = require('sequelize');

      const where = {};

      if (userId) {
        where.userId = parseInt(userId);
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      // Get total logs
      const totalLogs = await AuditLog.count({ where });

      // Count by action
      const actionCounts = await AuditLog.findAll({
        where,
        attributes: [
          'action',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['action'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      });

      // Count by resource
      const resourceCounts = await AuditLog.findAll({
        where,
        attributes: [
          'resource',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['resource'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });

      // Count by user
      const userCounts = await AuditLog.findAll({
        where,
        attributes: [
          'userId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['userId'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'role']
          }
        ]
      });

      // Recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentActivity = await AuditLog.count({
        where: {
          ...where,
          createdAt: { [Op.gte]: yesterday }
        }
      });

      res.json({
        success: true,
        data: {
          totalLogs,
          recentActivity,
          byAction: actionCounts.map(a => ({
            action: a.action,
            count: parseInt(a.get('count'))
          })),
          byResource: resourceCounts.map(r => ({
            resource: r.resource,
            count: parseInt(r.get('count'))
          })),
          byUser: userCounts.map(u => ({
            userId: u.userId,
            username: u.user?.username,
            role: u.user?.role,
            count: parseInt(u.get('count'))
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching audit stats'
      });
    }
  }
);

/**
 * @route   GET /api/admin/audit-logs/export
 * @desc    Export audit logs as JSON
 * @access  Admin
 */
router.get(
  '/export/json',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const { startDate, endDate, userId, action, resource } = req.query;

      const where = {};

      if (userId) where.userId = parseInt(userId);
      if (action) where.action = action;
      if (resource) where.resource = resource;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const logs = await AuditLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 10000, // Max export limit
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'role']
          }
        ]
      });

      // Set headers for download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=audit-logs-${new Date().toISOString()}.json`
      );

      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: logs.length,
        filters: { startDate, endDate, userId, action, resource },
        logs
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Error exporting audit logs'
      });
    }
  }
);

/**
 * @route   GET /api/admin/audit-logs/actions/list
 * @desc    Get list of all unique actions (for filters)
 * @access  Admin
 */
router.get(
  '/actions/list',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const actions = await AuditLog.findAll({
        attributes: ['action'],
        group: ['action'],
        order: [['action', 'ASC']]
      });

      const actionList = actions.map(a => a.action);

      res.json({
        success: true,
        data: actionList
      });
    } catch (error) {
      console.error('Error fetching actions:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching actions'
      });
    }
  }
);

/**
 * @route   GET /api/admin/audit-logs/resources/list
 * @desc    Get list of all unique resources (for filters)
 * @access  Admin
 */
router.get(
  '/resources/list',
  protect,
  requirePermission('audit_logs.view.all'),
  async (req, res) => {
    try {
      const resources = await AuditLog.findAll({
        attributes: ['resource'],
        group: ['resource'],
        order: [['resource', 'ASC']]
      });

      const resourceList = resources.map(r => r.resource);

      res.json({
        success: true,
        data: resourceList
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching resources'
      });
    }
  }
);

module.exports = router;
