# Create database script for Bettys books
#CREATE USER IF NOT EXISTS 'newshub_app'@'172.19.0.3' IDENTIFIED BY 'qwertyuiop'; 
#GRANT ALL PRIVILEGES ON newshub.* TO ' bettys_books_app'@'172.19.0.3';
CREATE USER IF NOT EXISTS 'newshub_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON newshub.* TO 'newshub_app'@'localhost';

# Create the database
CREATE DATABASE IF NOT EXISTS newshub;
USE newshub;

# Create the tables
#CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));

# Create the user
CREATE TABLE IF NOT EXISTS users (
    id int AUTO_INCREMENT,
    firstName varchar(50),
    lastName varchar(50),
    userName varchar(255),
    email varchar(255),
    hashedPassword varchar(255),
    PRIMARY KEY(id)
);
