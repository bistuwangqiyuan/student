const fs = require('fs');
const path = require('path');
const { neon, Pool } = require('@neondatabase/serverless');
const { hashPassword } = require('./auth');

async function runSchema() {
  const schemaPath = path.join(__dirname, '../../sql/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
  } finally {
    client.release();
    await pool.end();
  }
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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未配置');
  }
  const sql = neon(process.env.DATABASE_URL);
  await runSchema();
  await seedData(sql);
  return { message: '数据库初始化完成' };
}

module.exports = { initializeDatabase, runSchema, seedData };
