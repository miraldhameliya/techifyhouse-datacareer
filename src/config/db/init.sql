CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Insert default regular user (password: user123)
INSERT INTO users (username, password, role)
VALUES ('user', '$2b$10$YourHashedPasswordHere', 'user')
ON DUPLICATE KEY UPDATE username = username;

CREATE TABLE topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  companyId INT NOT NULL,
  topicId INT NOT NULL,
  dbType VARCHAR(255) NOT NULL,
  difficulty VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  content TEXT NOT NULL,
  schema TEXT,
  solution TEXT,
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (topicId) REFERENCES topics(id),
  solutionQuery TEXT
);

CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  questionId INT NOT NULL,
  code TEXT NOT NULL,
  dbType VARCHAR(255),
  score FLOAT,
  status ENUM('passed', 'failed', 'error'),
  result JSON,
  error TEXT,
  runTime INT,
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE company_domains (
  companyId INT NOT NULL,
  domainId INT NOT NULL,
  PRIMARY KEY (companyId, domainId),
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (domainId) REFERENCES domains(id)
);