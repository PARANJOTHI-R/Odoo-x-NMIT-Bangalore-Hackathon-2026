# Odoo-x-NMIT-Bangalore-Hackathon-2026
# Dayflow

Dayflow is a role-based employee management and HR platform designed to manage employees, attendance, leave, payroll, teams, and HR access control.

The application uses a React frontend, Express/Node.js backend, and PostgreSQL database hosted on Neon.

---

## 🚀 Features

### Authentication & Role-Based Access

- User registration and login
- JWT-based authentication
- Role-based access control
- Two supported roles:
  - `hr`
  - `employee`
- Role-based dashboard navigation
- Protected frontend routes
- Backend authorization

### Employee Management

- Employee profiles
- Employee information management
- Team assignment
- HR-controlled employee access

### Attendance

- Employee check-in
- Employee check-out
- Duplicate check-in prevention
- Current-day attendance tracking
- Attendance history
- Backend-driven attendance state
- Timezone-safe current-day detection

### HR Team Allocation

- Create teams
- Assign HR users to teams
- Assign employees to teams
- HR access restricted to assigned teams
- Backend-level team authorization
- Direct API access protection

### Leave Management

- Employee leave functionality
- HR access to team-scoped leave information

### Payroll

- Payroll information
- HR access restricted according to team permissions

---

# 🏗️ Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│  Authentication              │
│  Dashboards                  │
│  Attendance                  │
│  Employees                   │
│  Teams                       │
│  Leave                       │
│  Payroll                     │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│      Express Backend         │
│                              │
│  Authentication              │
│  Authorization               │
│  Controllers                 │
│  Models                      │
│  Business Logic              │
└──────────────┬───────────────┘
               │
               │ SQL
               ▼
┌──────────────────────────────┐
│      PostgreSQL / Neon       │
│                              │
│  Users                       │
│  Teams                       │
│  Attendance                  │
│  Leave                       │
│  Payroll                     │
│  HR Team Assignments         │
└──────────────────────────────┘
