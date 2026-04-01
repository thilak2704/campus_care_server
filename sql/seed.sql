USE campus_care;

INSERT INTO users (name, email, password_hash, role)
VALUES
  (
    'Admin User',
    'admin@campuscare.local',
    '$2a$10$QYTjLQwY6r0pP7OGV9r1b.Bcew4fJ8xj4T7dPvxI6Bfq5lHppZArW',
    'admin'
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name);
