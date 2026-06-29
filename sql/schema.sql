-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学生表（账号 + 信息合一）
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  student_no VARCHAR(20) UNIQUE,
  name VARCHAR(50),
  gender VARCHAR(10),
  age INTEGER,
  class_name VARCHAR(50),
  major VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_keyword ON students (student_no, name, class_name, major);
