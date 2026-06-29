const { neon } = require('@neondatabase/serverless');
const { getDatabaseUrl } = require('./db');
const { hashPassword } = require('./auth');

async function runSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_students_keyword
    ON students (student_no, name, class_name, major)
  `;
}

async function seedData(sql) {
  const adminHash = await hashPassword('admin');

  const existing = await sql`SELECT id FROM admins WHERE username = 'admin'`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO admins (username, password_hash)
      VALUES ('admin', ${adminHash})
    `;
  }

  const sampleStudents = [
    {
      username: 'zhangsan',
      password: '123456',
      student_no: '2024001',
      name: '张三',
      gender: '男',
      age: 20,
      class_name: '计算机2401班',
      major: '计算机科学与技术',
    },
    {
      username: 'lisi',
      password: '123456',
      student_no: '2024002',
      name: '李四',
      gender: '女',
      age: 19,
      class_name: '软件2401班',
      major: '软件工程',
    },
  ];

  for (const s of sampleStudents) {
    const exists = await sql`SELECT id FROM students WHERE username = ${s.username}`;
    if (exists.length === 0) {
      const pwdHash = await hashPassword(s.password);
      await sql`
        INSERT INTO students (username, password_hash, student_no, name, gender, age, class_name, major)
        VALUES (${s.username}, ${pwdHash}, ${s.student_no}, ${s.name}, ${s.gender}, ${s.age}, ${s.class_name}, ${s.major})
      `;
    }
  }
}

async function initializeDatabase() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('数据库连接未配置，请设置 DATABASE_URL 或 POSTGRES_URL');
  }
  const sql = neon(url);
  await runSchema(sql);
  await seedData(sql);
  return { message: '数据库初始化完成' };
}

module.exports = { initializeDatabase, runSchema, seedData };
