# NexusHR

### AI-Enabled Enterprise HR & Workforce Intelligence Platform

**Version 2.0 – Industry Edition** | Built by Zidio Development  
_Production-Grade Java Full-Stack HR System with Real-Time Analytics_

[![Java](https://img.shields.io/badge/Java-21-orange)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://www.postgresql.org/)

---

## 🚀 Quick Start (Docker Desktop)

The entire application — backend, frontend, PostgreSQL, and Redis — runs with a **single command**:

```bash
# Clone and run
git clone <repo-url>
cd Zidio
docker compose up --build
```

| Service     | URL                              | Description                  |
| :---------- | :------------------------------- | :--------------------------- |
| Frontend    | http://localhost:5173            | React + Vite Dev Server      |
| Backend API | http://localhost:8080/api        | Spring Boot REST API         |
| PostgreSQL  | localhost:5432                   | Database (nexushr db)        |
| Redis       | localhost:6379                   | Session Cache                |

> **Default Admin Account** — Register at the app with role `ADMIN`, or use the `/api/auth/register` endpoint.

---

## ✅ Feature Status

| ID | Feature | Status | Details |
| :--- | :--- | :--- | :--- |
| **F-01** | Employee Lifecycle Management | ✅ Complete | Create, update, delete employees with leave balance tracking |
| **F-02** | Attendance & Leave Management | ✅ Complete | Mark attendance, apply/approve leave with balance validation |
| **F-03** | Payroll Processing | ✅ Complete | Auto-calculated net salary + downloadable PDF payslips |
| **F-04** | Performance Reviews | ✅ Complete | Full CRUD with rating, feedback, goals, OKR status tracking |
| **F-05** | Dashboard & Analytics | ✅ Complete | Real-time stats: total, active, present today, absent today |
| **F-06** | Auth & RBAC | ✅ Complete | JWT-based auth, role-based access (ADMIN/HR/MANAGER/EMPLOYEE) |
| **F-07** | Dark/Light Theme | ✅ Complete | Client-side toggle persisted per session |

---

## 🏗️ Architecture

```
nexushr/
├── src/main/java/com/zidio/nexushr/
│   ├── controller/      # REST controllers (Auth, Employee, Attendance, Payroll, Leave, Performance, Dashboard)
│   ├── service/         # Business logic (leave balance validation, payroll net calc, PDF generation)
│   ├── entity/          # JPA entities (Employee, Attendance, Payroll, Leave, PerformanceReview, User)
│   ├── dto/             # Data Transfer Objects
│   ├── repository/      # Spring Data JPA repositories
│   ├── security/        # JWT filter, user details service
│   ├── config/          # Security config, CORS
│   └── exception/       # Global exception handler
│
└── frontend/
    ├── src/
    │   ├── pages/       # LandingPage.tsx, Dashboard.tsx
    │   ├── components/  # AuthModal.tsx, Toast.tsx, CountUp.tsx
    │   └── services/    # api.ts (fetch + auth session)
    ├── vite.config.ts   # Proxy: /api → backend:8080
    └── Dockerfile.dev   # Vite dev server container
```

---

## 🛠️ Technology Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Backend** | Java 21 + Spring Boot 3.5 | REST API, JWT Security, JPA |
| **Frontend** | React 19 + TypeScript + Vite 6 | SPA with dark/light theme |
| **Styling** | TailwindCSS v4 | Utility-first, custom design tokens |
| **Database** | PostgreSQL 17 | ACID, auto DDL via Hibernate |
| **Cache** | Redis 7 | Session management |
| **Auth** | Spring Security 6 + JWT (HS512) | Stateless, RBAC |
| **PDF** | OpenPDF (iText fork) | Payslip generation |
| **Containers** | Docker + Docker Compose | Multi-stage builds |

---

## 🔌 API Endpoints

All endpoints require `Authorization: Bearer <token>` except auth routes.

### Authentication
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |

### Employees
| Method | Endpoint | Role Required |
| :----- | :------- | :------------ |
| GET | `/api/employees` | Any authenticated |
| GET | `/api/employees/{id}` | Any authenticated |
| POST | `/api/employees` | ADMIN / HR |
| PUT | `/api/employees/{id}` | ADMIN / HR |
| DELETE | `/api/employees/{id}` | ADMIN |

### Attendance
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET | `/api/attendance` | All records (ADMIN/HR) |
| POST | `/api/attendance` | Mark attendance |
| PUT | `/api/attendance/{id}` | Update record |
| DELETE | `/api/attendance/{id}` | Delete (ADMIN/HR) |

### Payroll
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET | `/api/payroll` | All payrolls (ADMIN/HR) |
| POST | `/api/payroll` | Create payroll (net auto-calculated) |
| PUT | `/api/payroll/{id}` | Update payroll |
| GET | `/api/payroll/{id}/pdf` | Download PDF payslip |
| DELETE | `/api/payroll/{id}` | Delete (ADMIN) |

### Leave
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET | `/api/leaves` | All leave requests (ADMIN/HR/MANAGER) |
| POST | `/api/leaves` | Apply for leave (balance validated) |
| PUT | `/api/leaves/{id}/status?status=APPROVED` | Approve/reject leave |
| DELETE | `/api/leaves/{id}` | Delete (ADMIN) |

### Performance Reviews
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET | `/api/performance` | All reviews (ADMIN/HR/MANAGER) |
| POST | `/api/performance` | Submit review |
| PUT | `/api/performance/{id}` | Update review |
| DELETE | `/api/performance/{id}` | Delete (ADMIN) |

### Dashboard
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET | `/api/dashboard/stats` | Real-time stats (total, active, present, absent) |

---

## 💡 Business Logic Highlights

- **Payroll**: Net salary = Basic + Allowances − Deductions (auto-calculated)
- **Leave Balance**: 30 days default; deducted on approval, restored on rejection/cancellation
- **PDF Payslips**: Generated server-side using OpenPDF, downloadable directly from dashboard
- **RBAC**: ADMIN has full access; HR manages employees/payroll/leave; MANAGER can approve; EMPLOYEE can view own data

---

## 📦 Docker Compose Services

```yaml
services:
  db:       PostgreSQL 17  (port 5432)
  redis:    Redis 7        (port 6379)
  backend:  Spring Boot    (port 8080)
  frontend: Vite dev       (port 5173)
```

To restart with fresh data:
```bash
docker compose down -v   # removes volumes (clears DB)
docker compose up --build
```

---

*Prepared for Zidio Development – Java Full-Stack Domain | Reference: May–June 2026*
