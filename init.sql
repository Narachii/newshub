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

# Create the source table
CREATE TABLE IF NOT EXISTS source (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  PRIMARY KEY(id),

  CONSTRAINT unique_name UNIQUE (name)
);

# Create the news
CREATE TABLE IF NOT EXISTS news (
  id int NOT NULL AUTO_INCREMENT,
  author varchar(100),
  title varchar(255) NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  source_id int NOT NULL,
  url text,
  imageUrl text,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),

  FOREIGN KEY (source_id) REFERENCES source(id),
  UNIQUE KEY unique_author_title (title, author)
);

# Create the comments
CREATE TABLE IF NOT EXISTS comments (
  id int AUTO_INCREMENT,
  user_id int NOT NULL,
  news_id int NOT NULL,
  content text NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (news_id) REFERENCES news(id),

  UNIQUE KEY unique_user_news (user_id, news_id)
);


ALTER TABLE `users` ADD UNIQUE user_unique_username (`userName`);
DROP INDEX  unique_author_title ON news;
ALTER TABLE `news` ADD UNIQUE news_unique_title (`title`);
