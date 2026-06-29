-- =============================================================================
-- NexusHR — V1: Initial Schema
-- Generated for PostgreSQL 17
-- Replaces Hibernate ddl-auto: update for production-safe schema management
-- =============================================================================

-- ENUM types
CREATE TYPE employment_status AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED');
CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE');
CREATE TYPE payroll_status AS ENUM ('PENDING', 'PROCESSED', 'PAID', 'CANCELLED');
CREATE TYPE review_status AS ENUM ('DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE leave_type AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');
CREATE TYPE notification_type AS ENUM ('PAYROLL', 'LEAVE', 'PERFORMANCE', 'ATTENDANCE', 'GENERAL', 'AI_ALERT');

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    role         user_role    NOT NULL DEFAULT 'EMPLOYEE',
    enabled      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- =============================================================================
-- EMPLOYEES
-- =============================================================================
CREATE TABLE employees (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   VARCHAR(50)    NOT NULL UNIQUE,
    first_name    VARCHAR(100)   NOT NULL,
    last_name     VARCHAR(100)   NOT NULL,
    email         VARCHAR(255)   NOT NULL UNIQUE,
    phone         VARCHAR(30),
    department    VARCHAR(100),
    position      VARCHAR(100),
    hire_date     DATE           NOT NULL DEFAULT CURRENT_DATE,
    salary        NUMERIC(15, 2),
    leave_balance INTEGER        NOT NULL DEFAULT 30,
    status        employment_status NOT NULL DEFAULT 'ACTIVE',
    user_id       BIGINT         REFERENCES users (id) ON DELETE SET NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_email      ON employees (email);
CREATE INDEX idx_employees_status     ON employees (status);
CREATE INDEX idx_employees_department ON employees (department);

-- =============================================================================
-- ATTENDANCE
-- =============================================================================
CREATE TABLE attendance (
    id          BIGSERIAL PRIMARY KEY,
    employee_id BIGINT    NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    date        DATE      NOT NULL,
    check_in    TIME,
    check_out   TIME,
    status      attendance_status NOT NULL DEFAULT 'ABSENT',
    notes       TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_employee_date ON attendance (employee_id, date);
CREATE INDEX idx_attendance_date          ON attendance (date);
CREATE INDEX idx_attendance_status        ON attendance (status);

-- =============================================================================
-- LEAVES
-- =============================================================================
CREATE TABLE leaves (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT     NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    leave_type    leave_type NOT NULL DEFAULT 'ANNUAL',
    start_date    DATE       NOT NULL,
    end_date      DATE       NOT NULL,
    days          INTEGER    NOT NULL DEFAULT 1,
    reason        TEXT,
    status        leave_status NOT NULL DEFAULT 'PENDING',
    approved_by   BIGINT     REFERENCES employees (id) ON DELETE SET NULL,
    approved_at   TIMESTAMP,
    created_at    TIMESTAMP  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaves_employee ON leaves (employee_id);
CREATE INDEX idx_leaves_status   ON leaves (status);
CREATE INDEX idx_leaves_dates    ON leaves (start_date, end_date);

-- =============================================================================
-- PAYROLL
-- =============================================================================
CREATE TABLE payrolls (
    id           BIGSERIAL PRIMARY KEY,
    employee_id  BIGINT         NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    pay_period   VARCHAR(50)    NOT NULL,
    basic_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
    allowances   NUMERIC(15, 2)          DEFAULT 0,
    deductions   NUMERIC(15, 2)          DEFAULT 0,
    tax_amount   NUMERIC(15, 2)          DEFAULT 0,
    net_salary   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    pay_date     DATE,
    status       payroll_status NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payrolls_employee   ON payrolls (employee_id);
CREATE INDEX idx_payrolls_pay_period ON payrolls (pay_period);
CREATE INDEX idx_payrolls_status     ON payrolls (status);

-- =============================================================================
-- PERFORMANCE REVIEWS
-- =============================================================================
CREATE TABLE performance_reviews (
    id          BIGSERIAL PRIMARY KEY,
    employee_id BIGINT  NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    reviewer_id BIGINT  NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
    review_date DATE    NOT NULL,
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback    TEXT,
    goals       TEXT,
    status      review_status NOT NULL DEFAULT 'DRAFT',
    sentiment   VARCHAR(20),
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perf_employee ON performance_reviews (employee_id);
CREATE INDEX idx_perf_reviewer ON performance_reviews (reviewer_id);
CREATE INDEX idx_perf_status   ON performance_reviews (status);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    employee_id BIGINT            NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    title       VARCHAR(255)      NOT NULL,
    message     TEXT              NOT NULL,
    type        notification_type NOT NULL DEFAULT 'GENERAL',
    is_read     BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP         NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_employee ON notifications (employee_id);
CREATE INDEX idx_notifications_is_read  ON notifications (is_read);
