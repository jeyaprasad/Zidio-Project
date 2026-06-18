# NexusHR

### AI-Enabled Enterprise HR & Workforce Intelligence Platform

NexusHR is a modern, production-ready, intelligence-first Enterprise HR platform. It streamlines the complete employee lifecycle—from onboarding to attrition prediction—combining a robust Java 21 & Spring Boot 3 backend with a responsive React frontend.

---

## 🚀 Key Capabilities

| ID | Capability | Detailed Description & Business Value | Key Acceptance Criteria & Production Metrics |
| :--- | :--- | :--- | :--- |
| **F-01** | **Employee Lifecycle Management** | End-to-end onboarding, profile management, role assignment, and offboarding workflows. | Complete workflow with approval steps and document upload capabilities. |
| **F-02** | **Attendance & Leave Management** | Biometric simulation, leave requests submission, and manager approval workflows. | Real-time attendance dashboard and accurate leave balance calculations. |
| **F-03** | **Payroll Processing** | Automated salary calculation, tax deductions, and automated payslip generation. | Accurate payroll runs and exportable PDF payslips. |
| **F-04** | **Performance Management** | OKR/KPI goal setting, 360-degree feedback reviews, and manager rating system. | Interactive performance scorecards and history trend analysis. |
| **F-05** | **AI Workforce Insights** | Predictive attrition models, skill gap analysis, and employee engagement scoring. | AI-driven recommendations with **>80% accuracy** on sample dataset. |
| **F-06** | **Admin & Manager Dashboards** | Role-based visual metrics with comprehensive analytics and reporting. | Real-time dashboards with export options (PDF/Excel). |
| **F-07** | **Notification & Communication** | Multi-channel delivery (Email/SMS) for approvals, reminders, and company-wide announcements. | High reliability delivery with **>95% success rate**. |

---

## 🛠️ Production Technology Stack

### Core Platform
| Layer | Primary Technology | Rationale / Alternatives |
| :--- | :--- | :--- |
| **Backend** | Java 21 + Spring Boot 3.x | Enterprise standard, virtual threads support, excellent ecosystem. |
| **Frontend** | React 19 + TypeScript + Vite | Fast development, modern UI rendering, and efficient bundling. |
| **UI Components** | shadcn/ui + Tailwind CSS v4 | Consistent, fully accessible, and sleek modern design system. |
| **Database** | PostgreSQL 17 | ACID compliance, JSONB columns for flexible schemas. |
| **Cache** | Redis 7+ | Fast session management, rate-limiting, and real-time cache. |
| **Authentication**| Spring Security 6 + JWT | Stateless, secure, role-based access control (RBAC). |
| **AI Integration**| Spring AI + OpenAI / Hugging Face | Intelligent insights, NLP analysis, and workforce recommendations. |

### Infrastructure & DevOps
| Layer | Primary Technology | Rationale / Alternatives |
| :--- | :--- | :--- |
| **Containerization**| Docker (Multi-stage) | Consistent, secure, and lightweight immutable container builds. |
| **Orchestration** | Kubernetes + Helm | High availability, auto-scaling, and rolling updates in production. |
| **CI/CD** | GitHub Actions | Automated build testing, security scanning, and deployment pipelines. |
| **Monitoring** | Prometheus + Grafana + Sentry | Full end-to-end system observability, alert policies, and crash reporting. |

---

## ⚙️ Development Setup

The repository is organized as a single project with the Spring Boot backend at the root level and a prototype frontend in `index.html`.

### Prerequisites
To run the project locally, make sure you have the following installed:
1. **JDK 21**: Install a JDK 21 distribution (e.g. [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=21)) and configure `JAVA_HOME`.
2. **Redis**: A local Redis instance running on `localhost:6379`. You can spin one up instantly with Docker:
   ```bash
   docker run -d --name nexushr-redis -p 6379:6379 redis:alpine
   ```

### Running the Backend
1. Clone the repository and navigate to the project directory.
2. Build the project using the Maven wrapper:
   ```powershell
   ./mvnw clean install
   ```
3. Run the application:
   ```powershell
   ./mvnw spring-boot:run
   ```
   *Note: In development mode, the backend automatically uses an **in-memory H2 database** (`jdbc:h2:mem:nexushr`) with the H2 Console enabled at `/h2-console` for easy testing.*

### Running the Frontend
The prototype frontend is built into `index.html` at the root directory:
1. Open [index.html](index.html) directly in any web browser, OR
2. Serve it using a local server (e.g., the **Live Server** extension in VS Code).
3. The frontend is pre-configured to communicate with the local backend running on `http://localhost:8080/api`.

---

## 🔌 API Endpoints Reference

The backend exposes the following REST APIs under `/api`:
*   `POST /api/auth/register` - Register a new user account.
*   `POST /api/auth/login` - Authenticate and retrieve a JWT access token.
*   `GET /api/employees` - List all employees (Admin/HR view).
*   `GET /api/attendance` - Retrieve employee attendance records.
*   `GET /api/payroll` - Retrieve employee payroll summaries.
*   `GET /api/performance` - Retrieve performance reviews and OKR statuses.
*   `GET /api/dashboard/stats` - Fetch aggregate dashboard statistics.
