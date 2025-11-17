-- Create database (will be ignored if subsentry already provides the DB)
CREATE DATABASE IF NOT EXISTS subsentry;
USE subsentry;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    default_currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    bio TEXT,
    location VARCHAR(120),
    website VARCHAR(255),
    avatar VARCHAR(255),
    email_verified TINYINT(1) DEFAULT 0,
    enabled TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    email_notifications TINYINT(1) DEFAULT 1,
    browser_notifications TINYINT(1) DEFAULT 1,
    renewal_reminders TINYINT(1) DEFAULT 1,
    weekly_summary TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional sample user (remove in production)
INSERT IGNORE INTO users (
    id, name, email, password, default_currency, timezone, date_format,
    email_verified, enabled, email_notifications, browser_notifications,
    renewal_reminders, weekly_summary
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test User',
    'test@subsentry.com',
    '$2a$10$7a71RJKVQ1BM8DT6vKrrOudeum5wW7/dwZ0pniS3pS3kMt2rtI8p6',
    'USD',
    'UTC',
    'MM/DD/YYYY',
    1,
    1,
    1,
    1,
    1,
    0
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    category VARCHAR(60),
    billing_cycle ENUM('monthly','yearly','weekly','custom') DEFAULT 'monthly',
    start_date DATETIME,
    next_renewal_date DATETIME,
    status VARCHAR(30) DEFAULT 'active',
    auto_renewal TINYINT(1) DEFAULT 1,
    payment_method VARCHAR(120),
    portal_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(150),
    message TEXT NOT NULL,
    read_flag TINYINT(1) DEFAULT 0,
    action_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generated reports table
CREATE TABLE IF NOT EXISTS generated_reports (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(40) NOT NULL,
    format VARCHAR(20) DEFAULT 'pdf',
    status VARCHAR(30) DEFAULT 'completed',
    filters JSON,
    content JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_generated_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    frequency ENUM('weekly','monthly','quarterly') DEFAULT 'monthly',
    day_of_period INT DEFAULT 1,
    email_delivery TINYINT(1) DEFAULT 0,
    report_type VARCHAR(40) NOT NULL,
    filters JSON,
    next_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_scheduled_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics snapshots table (optional)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    snapshot_type VARCHAR(40) NOT NULL,
    payload JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analytics_snapshots_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;