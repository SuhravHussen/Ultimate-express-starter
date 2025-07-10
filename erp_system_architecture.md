# Multi-Organization ERP System Architecture

## Database Schema (MySQL)

### 1. Organizations Table
```sql
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    logo_url VARCHAR(500),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_global_admin BOOLEAN DEFAULT FALSE,
    is_global_super_admin BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. User Organization Roles Table (New)
```sql
CREATE TABLE user_organization_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    role ENUM('super_admin', 'admin') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_org (user_id, organization_id)
);
```

### 4. Employees Table
```sql
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE,
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 5. Payments Table
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('salary', 'bonus', 'overtime', 'deduction', 'other') NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'check', 'other') DEFAULT 'bank_transfer',
    description TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 6. Sessions Table (for authentication)
```sql
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Backend APIs (Express.js)

### Authentication APIs
```javascript
POST /api/auth/login
// Body: { email, password }
// Response: { 
//   user: {...}, 
//   token: "...", 
//   organizations: [{ id, name, role }], // Organizations user has access to
//   is_global_admin: boolean 
// }

POST /api/auth/switch-organization
// Headers: { Authorization: "Bearer <token>" }
// Body: { organization_id }
// Response: { 
//   current_organization: {...}, 
//   role: "super_admin|admin",
//   permissions: [...] 
// }

POST /api/auth/logout
// Headers: { Authorization: "Bearer <token>" }
// Response: { message: "Logged out successfully" }

GET /api/auth/me
// Headers: { Authorization: "Bearer <token>" }
// Response: { user: {...}, organization: {...} }
```

### User Management APIs
```javascript
GET /api/users
// Headers: { Authorization: "Bearer <token>" }
// Query: { organization_id?, page?, limit?, search? }
// Response: { users: [...], total: number, page: number, limit: number }

POST /api/users
// Headers: { Authorization: "Bearer <token>" }
// Body: { first_name, last_name, email, password, phone?, is_global_admin?, is_global_super_admin? }
// Response: { user: {...}, message: "User created successfully" }

PUT /api/users/:id
// Headers: { Authorization: "Bearer <token>" }
// Body: { first_name?, last_name?, email?, phone?, is_global_admin?, is_global_super_admin?, status? }
// Response: { user: {...}, message: "User updated successfully" }

DELETE /api/users/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { message: "User deleted successfully" }

PUT /api/users/:id/password
// Headers: { Authorization: "Bearer <token>" }
// Body: { current_password, new_password }
// Response: { message: "Password updated successfully" }

GET /api/users/:id/organizations
// Headers: { Authorization: "Bearer <token>" }
// Response: { organizations: [{ id, name, role, status }] }
```

### User Organization Role Management APIs
```javascript
GET /api/user-organization-roles
// Headers: { Authorization: "Bearer <token>" }
// Query: { user_id?, organization_id?, page?, limit? }
// Response: { roles: [...], total: number, page: number, limit: number }

POST /api/user-organization-roles
// Headers: { Authorization: "Bearer <token>" }
// Body: { user_id, organization_id, role }
// Response: { role: {...}, message: "Role assigned successfully" }

PUT /api/user-organization-roles/:id
// Headers: { Authorization: "Bearer <token>" }
// Body: { role?, status? }
// Response: { role: {...}, message: "Role updated successfully" }

DELETE /api/user-organization-roles/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { message: "Role removed successfully" }

GET /api/user-organization-roles/user/:user_id
// Headers: { Authorization: "Bearer <token>" }
// Response: { roles: [{ organization: {...}, role: "...", status: "..." }] }
```

### Organization Management APIs
```javascript
GET /api/organizations
// Headers: { Authorization: "Bearer <token>" }
// Query: { page?, limit?, search? }
// Response: { organizations: [...], total: number, page: number, limit: number }

POST /api/organizations
// Headers: { Authorization: "Bearer <token>" }
// Body: { name, email?, phone?, address?, logo_url? }
// Response: { organization: {...}, message: "Organization created successfully" }

PUT /api/organizations/:id
// Headers: { Authorization: "Bearer <token>" }
// Body: { name?, email?, phone?, address?, logo_url?, status? }
// Response: { organization: {...}, message: "Organization updated successfully" }

DELETE /api/organizations/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { message: "Organization deleted successfully" }

GET /api/organizations/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { organization: {...} }
```

### Employee Management APIs
```javascript
GET /api/employees
// Headers: { Authorization: "Bearer <token>" }
// Query: { organization_id?, page?, limit?, search?, status? }
// Response: { employees: [...], total: number, page: number, limit: number }

POST /api/employees
// Headers: { Authorization: "Bearer <token>" }
// Body: { employee_id, first_name, last_name, email?, phone?, position?, department?, salary?, hire_date?, organization_id? }
// Response: { employee: {...}, message: "Employee created successfully" }

PUT /api/employees/:id
// Headers: { Authorization: "Bearer <token>" }
// Body: { first_name?, last_name?, email?, phone?, position?, department?, salary?, status? }
// Response: { employee: {...}, message: "Employee updated successfully" }

DELETE /api/employees/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { message: "Employee deleted successfully" }

GET /api/employees/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { employee: {...} }
```

### Payment Management APIs
```javascript
GET /api/payments
// Headers: { Authorization: "Bearer <token>" }
// Query: { organization_id?, employee_id?, page?, limit?, payment_type?, status?, date_from?, date_to? }
// Response: { payments: [...], total: number, page: number, limit: number }

POST /api/payments
// Headers: { Authorization: "Bearer <token>" }
// Body: { employee_id, amount, payment_type, payment_date, payment_method?, description?, organization_id? }
// Response: { payment: {...}, message: "Payment created successfully" }

PUT /api/payments/:id
// Headers: { Authorization: "Bearer <token>" }
// Body: { amount?, payment_type?, payment_date?, payment_method?, description?, status? }
// Response: { payment: {...}, message: "Payment updated successfully" }

DELETE /api/payments/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { message: "Payment deleted successfully" }

GET /api/payments/:id
// Headers: { Authorization: "Bearer <token>" }
// Response: { payment: {...} }

GET /api/payments/employee/:employee_id
// Headers: { Authorization: "Bearer <token>" }
// Query: { page?, limit?, payment_type?, status?, date_from?, date_to? }
// Response: { payments: [...], total: number, page: number, limit: number }
```

### Dashboard/Stats APIs
```javascript
GET /api/dashboard/stats
// Headers: { Authorization: "Bearer <token>" }
// Query: { organization_id? }
// Response: { 
//   total_employees: number,
//   active_employees: number,
//   total_payments: number,
//   monthly_payments: number,
//   organizations_count: number (for global admins)
// }
```

## Frontend Pages (Next.js)

### 1. Authentication Pages
- **Login Page** (`/login`)
  - Login form with email and password
  - Role-based redirect after login
  - Forgot password link

### 2. Global Admin Pages (for global admins)
- **Global Dashboard** (`/global/dashboard`)
  - Overview of all organizations
  - Total stats across all organizations
  - Recent activities

- **Organizations Management** (`/global/organizations`)
  - List all organizations with search and filters
  - Create new organization
  - Edit organization details
  - Delete organization
  - View organization details

- **Global Users Management** (`/global/users`)
  - List all users across organizations
  - Create new users
  - Edit user details and global permissions
  - Assign users to organizations with roles
  - Remove users from organizations

- **User Organization Role Management** (`/global/user-roles`)
  - Assign users to multiple organizations
  - Manage user roles per organization
  - Bulk role assignments
  - View user-organization matrix

### 3. Organization Selection & Switching
- **Organization Selector** (`/select-organization`)
  - List of organizations user has access to
  - Role display for each organization
  - Quick switch between organizations

- **Multi-Organization Dashboard** (`/dashboard`)
  - Overview of all organizations user has access to
  - Quick stats from each organization
  - Recent activities across organizations
  - Organization switcher in header
- **Organization Dashboard** (`/org/dashboard`)
  - Organization-specific stats
  - Employee count, payment summary
  - Recent activities within organization

- **Employee Management** (`/org/employees`)
  - List employees with pagination and search
  - Add new employee form
  - Edit employee details
  - Delete employee
  - View employee profile

- **Payment Management** (`/org/payments`)
  - List all payments with filters
  - Add new payment form
  - Edit payment details
  - Delete payment
  - Payment history per employee

- **Organization Settings** (`/org/settings`)
  - Update organization profile
  - Organization admin management
  - Organization preferences

### 5. Common Pages
- **Profile Page** (`/profile`)
  - Edit personal information
  - Change password
  - View account details

- **Employee Detail Page** (`/org/employees/[id]`)
  - Employee information
  - Payment history for this employee
  - Edit employee actions

- **Payment Detail Page** (`/org/payments/[id]`)
  - Payment details
  - Edit payment information

### 6. Layout Components
- **Sidebar Navigation**
  - Role-based menu items
  - Organization switcher dropdown
  - Current organization display
  - Logout option

- **Header**
  - User profile dropdown
  - Organization switcher
  - Current organization and role display
  - Notifications (future feature)

## Page Functionalities

### Multi-Organization Dashboard
- View all organizations user has access to
- Role-based stats for each organization
- Quick actions per organization
- Organization switcher functionality

### User Organization Role Management
- Assign users to multiple organizations
- Set different roles per organization
- Bulk role management
- Visual user-organization matrix

### Organization Selection
- List accessible organizations
- Role display for each organization
- Quick switching between organizations
- Recent organization access history

### Organization Dashboard  
- View organization-specific employee count
- View monthly payment summary
- View recent employee additions
- Quick access to add employee/payment

### Employee Management
- CRUD operations for employees
- Search and filter employees
- Bulk actions (future enhancement)
- Export employee list

### Payment Management
- CRUD operations for payments
- Filter by employee, date range, payment type
- Payment history tracking
- Monthly/yearly payment reports

### User Management
- Role-based user creation
- Password reset functionality
- User status management
- Permission-based access control

## Role-Based Access Control

### Global Admin
- Full access to all organizations and system management
- Can create/edit/delete organizations
- Can create/edit/delete any user
- Can assign users to organizations with roles
- Can access all data across organizations

### Organization Super Admin (per organization)
- Full access to their assigned organizations
- Can create/edit/delete employees in their organizations
- Can create/edit/delete payments in their organizations
- Can manage other organization admins for their organizations
- Can have this role in multiple organizations

### Organization Admin (per organization)
- Read/write access to their assigned organizations
- Can create/edit employees in their organizations
- Can create/edit payments in their organizations
- Cannot manage other admins
- Can have this role in multiple organizations

## Technical Stack
- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript, JWT authentication
- **Database**: MySQL with proper indexing
- **ORM/Query Builder**: Prisma or direct MySQL queries
- **Validation**: Joi or Zod for API validation
- **State Management**: React Context or Zustand for global state

## Example User Scenarios

### Scenario 1: Multi-Organization Admin
- User John is admin for Company A and Company B
- John logs in and sees both organizations in his dashboard
- John can switch between Company A and Company B
- In Company A: John has 'super_admin' role
- In Company B: John has 'admin' role
- John's permissions change based on current organization context

### Scenario 2: Global Admin with Organization Access
- User Sarah is a global admin
- Sarah has access to all organizations in the system
- Sarah can also be assigned specific roles in certain organizations
- Sarah can manage system-wide settings and user assignments

### Scenario 3: Limited Organization Access
- User Mike is admin only for Company C
- Mike logs in and directly goes to Company C dashboard
- Mike cannot see or access other organizations
- Mike can manage employees and payments only in Company C

## Implementation Notes

### Authentication Flow
1. User logs in with email/password
2. System returns user info + list of accessible organizations
3. User selects organization or is redirected to default
4. Organization context is maintained in session/state
5. All API calls include current organization context

### Permission Checking
```javascript
// Middleware to check organization access
function checkOrganizationAccess(req, res, next) {
  const userId = req.user.id;
  const organizationId = req.params.organization_id || req.body.organization_id;
  
  // Check if user is global admin
  if (req.user.is_global_admin) {
    return next();
  }
  
  // Check if user has access to specific organization
  const hasAccess = checkUserOrganizationRole(userId, organizationId);
  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
}
```

### Frontend State Management
```javascript
// User context with organization switching
const UserContext = {
  user: {...},
  currentOrganization: {...},
  accessibleOrganizations: [...],
  currentRole: "super_admin|admin",
  isGlobalAdmin: boolean,
  switchOrganization: (orgId) => {...}
}
```