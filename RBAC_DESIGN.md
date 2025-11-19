# RBAC System Design - EduMaster

## Role Definitions

### 1. **student** (Default Role)
- Enroll in courses
- Study flashcards
- Track personal progress
- Earn achievements
- View own statistics

### 2. **teacher**
- All student permissions +
- Create courses
- Edit own courses
- Delete own courses
- Create/edit/delete cards for own courses
- View enrollment statistics for own courses
- Publish/unpublish own courses

### 3. **admin**
- All teacher permissions +
- Edit ANY course
- Delete ANY course
- View all users
- Change user roles (student ↔ teacher)
- Deactivate/activate users
- View platform-wide statistics
- View audit logs
- Manage achievements

### 4. **super_admin**
- All admin permissions +
- Promote/demote admins
- Delete users permanently
- Access system settings
- View all audit logs
- Manage permissions

---

## Permission Matrix

| Permission | student | teacher | admin | super_admin |
|-----------|---------|---------|-------|-------------|
| **Courses** |
| courses.view.published | ✓ | ✓ | ✓ | ✓ |
| courses.view.unpublished | - | own | ✓ | ✓ |
| courses.create | - | ✓ | ✓ | ✓ |
| courses.edit.own | - | ✓ | ✓ | ✓ |
| courses.edit.any | - | - | ✓ | ✓ |
| courses.delete.own | - | ✓ | ✓ | ✓ |
| courses.delete.any | - | - | ✓ | ✓ |
| courses.publish | - | own | ✓ | ✓ |
| **Cards** |
| cards.view.own | ✓ | ✓ | ✓ | ✓ |
| cards.view.templates | - | own | ✓ | ✓ |
| cards.create | - | ✓ | ✓ | ✓ |
| cards.edit.own | ✓ | ✓ | ✓ | ✓ |
| cards.edit.templates | - | own | ✓ | ✓ |
| cards.delete.own | - | ✓ | ✓ | ✓ |
| cards.delete.any | - | - | ✓ | ✓ |
| **Users** |
| users.view.own | ✓ | ✓ | ✓ | ✓ |
| users.view.all | - | - | ✓ | ✓ |
| users.edit.own | ✓ | ✓ | ✓ | ✓ |
| users.edit.any | - | - | ✓ | ✓ |
| users.delete | - | - | - | ✓ |
| users.change_role.student | - | - | ✓ | ✓ |
| users.change_role.teacher | - | - | ✓ | ✓ |
| users.change_role.admin | - | - | - | ✓ |
| users.deactivate | - | - | ✓ | ✓ |
| **Achievements** |
| achievements.view | ✓ | ✓ | ✓ | ✓ |
| achievements.create | - | - | ✓ | ✓ |
| achievements.edit | - | - | ✓ | ✓ |
| achievements.delete | - | - | - | ✓ |
| **System** |
| audit_logs.view.own | - | ✓ | ✓ | ✓ |
| audit_logs.view.all | - | - | ✓ | ✓ |
| stats.view.own | ✓ | ✓ | ✓ | ✓ |
| stats.view.course | - | own | ✓ | ✓ |
| stats.view.platform | - | - | ✓ | ✓ |
| system.settings | - | - | - | ✓ |

---

## Database Schema

### **Users Table** (Modified)
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';
ALTER TABLE users ADD COLUMN roleChangedAt TIMESTAMP;
ALTER TABLE users ADD COLUMN roleChangedBy INTEGER REFERENCES users(id);
CREATE INDEX idx_users_role ON users(role);
```

### **Permissions Table** (New)
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **RolePermissions Table** (New)
```sql
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (permission) REFERENCES permissions(name),
  UNIQUE(role, permission)
);
```

### **AuditLogs Table** (New)
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resourceId INTEGER,
  details JSONB,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(userId);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_created ON audit_logs(createdAt DESC);
```

---

## API Endpoints

### **Admin - Course Management**
```
GET    /api/admin/courses           - List all courses (with filters)
POST   /api/admin/courses           - Create course template
GET    /api/admin/courses/:id       - Get course details
PUT    /api/admin/courses/:id       - Update course
DELETE /api/admin/courses/:id       - Delete course
PUT    /api/admin/courses/:id/publish - Publish/unpublish
POST   /api/admin/courses/:id/duplicate - Duplicate course
```

### **Admin - Card Management**
```
GET    /api/admin/cards             - List template cards
POST   /api/admin/cards             - Create card template
GET    /api/admin/cards/:id         - Get card details
PUT    /api/admin/cards/:id         - Update card
DELETE /api/admin/cards/:id         - Delete card
POST   /api/admin/cards/bulk        - Bulk create cards
PUT    /api/admin/cards/bulk        - Bulk update cards
DELETE /api/admin/cards/bulk        - Bulk delete cards
```

### **Admin - User Management**
```
GET    /api/admin/users             - List all users
GET    /api/admin/users/:id         - Get user details
PUT    /api/admin/users/:id         - Update user
PUT    /api/admin/users/:id/role    - Change user role
PUT    /api/admin/users/:id/status  - Activate/deactivate
DELETE /api/admin/users/:id         - Delete user (super_admin only)
GET    /api/admin/users/:id/activity - User activity logs
```

### **Admin - Role & Permission Management**
```
GET    /api/admin/roles             - List all roles
GET    /api/admin/roles/:role/permissions - Get role permissions
PUT    /api/admin/roles/:role/permissions - Update role permissions (super_admin)
```

### **Admin - Audit Logs**
```
GET    /api/admin/audit-logs        - List audit logs (with filters)
GET    /api/admin/audit-logs/:id    - Get log details
GET    /api/admin/audit-logs/export - Export logs (CSV/JSON)
```

### **Admin - Statistics**
```
GET    /api/admin/stats/overview    - Platform overview
GET    /api/admin/stats/users       - User statistics
GET    /api/admin/stats/courses     - Course statistics
GET    /api/admin/stats/engagement  - Engagement metrics
```

---

## Middleware Architecture

### **1. Authentication Middleware** (Existing - Enhanced)
```javascript
// middleware/auth.js
// Verifies JWT and attaches user to req.user
```

### **2. RBAC Middleware** (New)
```javascript
// middleware/rbac.js

// Check if user has specific role
requireRole(['admin', 'super_admin'])

// Check if user has specific permission
requirePermission('courses.edit.any')

// Check ownership or admin
requireOwnershipOr('courses.edit.own', 'courses.edit.any')
```

### **3. Audit Logging Middleware** (New)
```javascript
// middleware/auditLog.js

// Automatically log admin actions
auditLog('course.update', 'courses', courseId, changes)
```

---

## Frontend Admin Structure

```
/admin
  /login               - Admin login (checks role after auth)
  /dashboard           - Overview, quick stats, recent activity
  /courses             - Course list with search/filter
  /courses/new         - Create new course
  /courses/:id/edit    - Edit course details
  /courses/:id/cards   - Manage course cards
  /users               - User management (list, search, filter)
  /users/:id           - User detail & edit
  /users/:id/activity  - User audit trail
  /roles               - Role & permission management (super_admin)
  /audit-logs          - Audit log viewer with filters
  /settings            - System settings (super_admin)
```

---

## Security Considerations

### **1. Token-Based Role Checking**
- Never trust client-side role information
- Always verify role from database on sensitive operations
- Include role in JWT but verify against DB for admin actions

### **2. Audit Everything**
- Log all admin actions (create, update, delete)
- Store IP address and user agent
- Include before/after state for updates
- Keep logs immutable (no deletion, only archiving)

### **3. Rate Limiting**
- Stricter limits on admin endpoints
- Failed login attempt tracking
- Temporary lockout after 5 failed attempts

### **4. Permission Checks**
- Check permissions at both route level and service level
- Use middleware chains: [auth, requireRole, auditLog]
- Verify ownership for resource-specific permissions

### **5. Data Protection**
- Never return password fields
- Mask sensitive user data in audit logs
- Encrypt sensitive audit log details

---

## Implementation Phases

### **Phase 1: Database & Models** (Day 1)
- [ ] Create migrations for role, permissions, audit_logs
- [ ] Update User model
- [ ] Create Permission and AuditLog models
- [ ] Seed initial permissions

### **Phase 2: Backend Middleware** (Day 1-2)
- [ ] Build RBAC middleware
- [ ] Build audit logging utility
- [ ] Update existing routes with RBAC

### **Phase 3: Admin API** (Day 2-3)
- [ ] Course management endpoints
- [ ] Card management endpoints
- [ ] User management endpoints
- [ ] Audit log endpoints

### **Phase 4: Frontend Admin UI** (Day 4-6)
- [ ] Admin dashboard layout
- [ ] Course management pages
- [ ] Card management pages
- [ ] User management pages
- [ ] Audit log viewer

### **Phase 5: Testing & Documentation** (Day 7)
- [ ] Test all RBAC permissions
- [ ] Test audit logging
- [ ] Create admin user guide
- [ ] API documentation

---

## Default Super Admin

Create initial super_admin user:
```sql
INSERT INTO users (username, email, password, role, fullName)
VALUES ('superadmin', 'admin@edumaster.com', '[HASHED]', 'super_admin', 'Super Administrator');
```

---

## Next Steps

1. Review this design document
2. Confirm permission structure is complete
3. Begin Phase 1 implementation
4. Iterate based on feedback
