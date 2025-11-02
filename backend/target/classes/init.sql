-- Create database (will be ignored if Railway already provides the DB)
CREATE DATABASE IF NOT EXISTS railway;
USE railway;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    default_currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    avatar VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    browser_notifications BOOLEAN DEFAULT TRUE,
    renewal_reminders BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT FALSE
);

-- Optional sample user (remove in production)
INSERT IGNORE INTO users (id, name, email, password)
VALUES ('1', 'Test User', 'test@example.com', 'password123');