-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS scheduler_db;
USE scheduler_db;

-- Drop tables if they exist
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS special_events;
DROP TABLE IF EXISTS course_constraints;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS departments;

-- Departments table (for different specializations/majors)
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table (A, B, C, D, E, F)
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Courses table (A10, Q10, V30, etc.)
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_course_id INT DEFAULT NULL, -- For subcourses like Q11, Q12 under Q10
  total_hours INT NOT NULL,
  theory_hours INT DEFAULT 0,
  practical_hours INT DEFAULT 0,
  department_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Course constraints table (to store rules for specific courses)
CREATE TABLE course_constraints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  max_hours_per_week INT,
  max_hours_per_day INT,
  can_be_morning BOOLEAN DEFAULT TRUE,
  can_be_afternoon BOOLEAN DEFAULT TRUE,
  requires_consecutive_hours BOOLEAN DEFAULT FALSE,
  min_days_before_exam INT DEFAULT 0,
  exam_duration_hours INT DEFAULT 0,
  grouped_classes TEXT, -- Stores class IDs that should be grouped together, e.g., "1,2" for A-B
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Special events table (flag raising, holidays, training, etc.)
CREATE TABLE special_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  duration_days INT DEFAULT 1,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(50), -- e.g., 'FIRST_MONDAY' for flag raising
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule table (the actual class schedule)
CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  course_id INT,
  day_of_week INT, -- 1 = Monday, 2 = Tuesday, etc.
  week_number INT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_practical BOOLEAN DEFAULT FALSE,
  is_exam BOOLEAN DEFAULT FALSE,
  is_self_study BOOLEAN DEFAULT FALSE,
  special_event_id INT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (special_event_id) REFERENCES special_events(id) ON DELETE SET NULL
);

-- Insert initial data for departments
INSERT INTO departments (name, description) VALUES
('Sơ cấp báo vụ', 'Chuyên ngành sơ cấp báo vụ');

-- Insert initial data for classes
INSERT INTO classes (name, department_id) VALUES
('A', 1),
('B', 1),
('C', 1),
('D', 1),
('E', 1),
('F', 1);

-- Insert initial data for courses
INSERT INTO courses (code, name, parent_course_id, total_hours, theory_hours, practical_hours, department_id) VALUES
-- Main courses
('A10', 'Môn A10', NULL, 160, 160, 0, 1),
('Q10', 'Môn Q10', NULL, 100, 50, 50, 1),
('V30', 'Môn V30', NULL, 240, 240, 0, 1),
('V31', 'Môn V31', NULL, 280, 280, 0, 1),
('V32', 'Môn V32', NULL, 36, 36, 0, 1),
('V33', 'Môn V33', NULL, 87, 87, 0, 1),
('V34', 'Môn V34', NULL, 120, 120, 0, 1),

-- Q10 subcourses
('Q11', 'Môn Q11', 2, 12, 0, 12, 1),
('Q12', 'Môn Q12', 2, 10, 2, 8, 1),
('Q13', 'Môn Q13', 2, 30, 12, 18, 1),
('Q14', 'Môn Q14', 2, 8, 4, 4, 1),
('Q15', 'Môn Q15', 2, 12, 0, 12, 1),
('Q17', 'Môn Q17', 2, 10, 10, 0, 1),
('Q18', 'Môn Q18', 2, 18, 12, 6, 1);

-- Insert constraints for courses
INSERT INTO course_constraints (course_id, max_hours_per_week, max_hours_per_day, can_be_morning, can_be_afternoon, requires_consecutive_hours, min_days_before_exam, exam_duration_hours, grouped_classes, notes) VALUES
(1, 10, 4, TRUE, TRUE, FALSE, 5, 3, '1,2|3,4|5,6', 'A10 học ghép lớp: A-B, C-D, E-F'),
(2, NULL, NULL, TRUE, TRUE, FALSE, 2, 6, NULL, 'Q10 gồm nhiều môn nhỏ'),
(3, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'Môn V30 học song song với V31'),
(4, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'Môn V31 học song song với V30'),
(6, NULL, NULL, TRUE, TRUE, FALSE, 2, 6, NULL, 'V33 học sau khi kiểm tra xong đề mục 3'),
(7, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'V34 học cuối cùng trong 3 tuần liên tục'),
(8, NULL, NULL, FALSE, TRUE, TRUE, 0, 0, NULL, 'Q11: Chỉ thực hành, chỉ xếp vào buổi chiều'),
(9, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'Q12: học 2 tiết lý thuyết và 8 tiết thực hành'),
(10, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'Q13: 12 Lý thuyết, 18 thực hành, thực hành chỉ xếp buổi chiều'),
(11, NULL, NULL, TRUE, TRUE, TRUE, 0, 0, NULL, 'Q14: 4 lý thuyết, 4 thực hành'),
(12, NULL, NULL, FALSE, TRUE, TRUE, 0, 0, NULL, 'Q15: Chỉ học thực hành và chỉ xếp học buổi chiều'),
(13, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'Q17: có thể xếp vào buổi sáng hoặc buổi chiều'),
(14, NULL, NULL, TRUE, TRUE, FALSE, 0, 0, NULL, 'Q18: 12 lý thuyết, 6 thực hành, thực hành xếp sau lý thuyết');

-- Insert some standard special events
INSERT INTO special_events (name, description, date, duration_days, recurring, recurring_pattern) VALUES
('Chào cờ', 'Buổi chào cờ đầu tháng', '2025-06-09', 1, TRUE, 'FIRST_MONDAY'),
('Bảo quản', 'Bảo quản chiều thứ 5 hàng tuần', '2025-06-12', 1, TRUE, 'EVERY_THURSDAY'),
('Quốc khánh', 'Nghỉ lễ Quốc khánh', '2025-09-02', 2, FALSE, NULL),
('Khai giảng', 'Buổi lễ khai giảng', '2025-09-15', 1, FALSE, NULL),
('Tập huấn cán bộ', 'Tập huấn cán bộ', '2025-10-01', 3, FALSE, NULL),
('Ngày nhà giáo', 'Ngày Nhà giáo Việt Nam', '2025-11-20', 1, FALSE, NULL);