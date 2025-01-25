-- Select the database you want to work with
USE CollegeProject;

-- Create Users table if it does not exist
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    course VARCHAR(255),
    gender VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Posts table if it does not exist
CREATE TABLE IF NOT EXISTS Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Comments table if it does not exist
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    user_id INT,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Messages table if it does not exist
CREATE TABLE IF NOT EXISTS Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    message_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Friends table if it does not exist
CREATE TABLE IF NOT EXISTS Friends (
    friendship_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id_1 INT,
    user_id_2 INT,
    status ENUM('Pending', 'Accepted', 'Declined') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_1) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Add an OTP column to store the hashed OTP
ALTER TABLE users
ADD COLUMN otp VARCHAR(255) DEFAULT NULL;

-- Add columns for OTP and its expiry
--ALTER TABLE users ADD COLUMN otp VARCHAR(6);
ALTER TABLE users ADD COLUMN otp_expiry DATETIME;



