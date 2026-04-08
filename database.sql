-- Create Database
CREATE DATABASE IF NOT EXISTS campus_care_db;
USE campus_care_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    profile_picture VARCHAR(255),
    role ENUM('student', 'tutor', 'admin') DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_student_id (student_id)
);

-- Laundry Services Table
CREATE TABLE IF NOT EXISTS laundry_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_kg DECIMAL(10,2),
    price_per_item DECIMAL(10,2),
    estimated_days INT DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laundry Orders Table
CREATE TABLE IF NOT EXISTS laundry_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    weight_kg DECIMAL(10,2),
    item_count INT,
    total_price DECIMAL(10,2) NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    special_instructions TEXT,
    status ENUM('pending', 'confirmed', 'picked_up', 'processing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES laundry_services(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_date (pickup_date)
);

-- Tutors Table
CREATE TABLE IF NOT EXISTS tutors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    specialization VARCHAR(200),
    qualification VARCHAR(200),
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(10,2) NOT NULL,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject (subject),
    INDEX idx_rating (rating)
);

-- Tutoring Sessions Table
CREATE TABLE IF NOT EXISTS tutoring_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tutor_id INT NOT NULL,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(3,1),
    total_price DECIMAL(10,2) NOT NULL,
    location_type ENUM('online', 'in_person') DEFAULT 'online',
    location_details TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    INDEX idx_tutor (tutor_id),
    INDEX idx_student (student_id),
    INDEX idx_date (session_date),
    INDEX idx_status (status)
);

-- Marketplace Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Listings Table
CREATE TABLE IF NOT EXISTS listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    `condition` ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good',
    images JSON,
    location VARCHAR(200),
    is_negotiable BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'sold', 'reserved', 'inactive') DEFAULT 'active',
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_seller (seller_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price),
    FULLTEXT INDEX idx_search (title, description)
);

-- Study Materials Table
CREATE TABLE IF NOT EXISTS study_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    course_code VARCHAR(20),
    type ENUM('notes', 'past_paper', 'study_guide', 'cheat_sheet', 'textbook', 'other') DEFAULT 'notes',
    file_url VARCHAR(500) NOT NULL,
    file_size INT,
    downloads_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'inactive', 'reported') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_subject (subject),
    INDEX idx_type (type),
    FULLTEXT INDEX idx_search (title, description)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reviewer_id INT NOT NULL,
    tutor_id INT,
    listing_id INT,
    material_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    INDEX idx_tutor (tutor_id),
    INDEX idx_listing (listing_id),
    INDEX idx_material (material_id),
    CHECK (
        (tutor_id IS NOT NULL AND listing_id IS NULL AND material_id IS NULL) OR
        (tutor_id IS NULL AND listing_id IS NOT NULL AND material_id IS NULL) OR
        (tutor_id IS NULL AND listing_id IS NULL AND material_id IS NOT NULL)
    )
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    listing_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_read (is_read)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Insert Sample Data
-- Categories
INSERT INTO categories (name, slug, icon) VALUES
('Furniture', 'furniture', '🪑'),
('Electronics', 'electronics', '💻'),
('Textbooks', 'textbooks', '📚'),
('Clothing', 'clothing', '👕'),
('Sports', 'sports', '⚽'),
('Other', 'other', '📦')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
icon = VALUES(icon);

-- Laundry Services
INSERT INTO laundry_services (name, description, price_per_kg, price_per_item, estimated_days) VALUES
('Wash & Fold', 'Professional washing and folding service', 5.99, NULL, 2),
('Wash & Iron', 'Washing, drying, and ironing service', 8.99, NULL, 2),
('Dry Clean', 'Professional dry cleaning', NULL, 12.99, 3),
('Bedding Set', 'Complete bedding cleaning service', NULL, 15.99, 2);

-- Insert Sample User (password: password123)
INSERT INTO users (name, email, student_id, password_hash, is_verified, role) VALUES
('Admin User', 'admin@campuscare.edu', 'ADMIN001', '$2a$10$Sq.Mp8F6SyOHKSWiue2ZfekIotL/yJDSQVzT5v.lDdan0GK8XXXRm', TRUE, 'admin')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
password_hash = VALUES(password_hash),
is_verified = VALUES(is_verified),
role = VALUES(role);

-- Sample Tutors
INSERT INTO tutors (user_id, subject, specialization, qualification, experience_years, hourly_rate, bio, is_verified) VALUES
(1, 'Mathematics', 'Calculus, Linear Algebra', 'PhD in Mathematics', 5, 45.00, 'Expert math tutor with proven results', TRUE);
