const { getSql } = require('../lib/db');
const { hashPassword, requireAuth } = require('../lib/auth');
const { success, error, parseBody } = require('../lib/response');

function formatStudent(row) {
  return {
    id: row.id,
    username: row.username,
    student_no: row.student_no,
    name: row.name,
    gender: row.gender,
    age: row.age,
    class_name: row.class_name,
    major: row.major,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = async function handler(req, res) {
  const authResult = requireAuth(req, ['admin']);
  if (authResult.error) {
    return error(res, authResult.error, authResult.status);
  }

  const sql = getSql();

  if (req.method === 'GET') {
    try {
      const keyword = (req.query.keyword || '').trim();
      let rows;

      if (keyword) {
        const pattern = `%${keyword}%`;
        rows = await sql`
          SELECT id, username, student_no, name, gender, age, class_name, major, created_at, updated_at
          FROM students
          WHERE student_no ILIKE ${pattern}
             OR name ILIKE ${pattern}
             OR class_name ILIKE ${pattern}
             OR major ILIKE ${pattern}
             OR username ILIKE ${pattern}
          ORDER BY id DESC
        `;
      } else {
        rows = await sql`
          SELECT id, username, student_no, name, gender, age, class_name, major, created_at, updated_at
          FROM students
          ORDER BY id DESC
        `;
      }

      return success(res, rows.map(formatStudent));
    } catch (err) {
      console.error('List students error:', err);
      return error(res, '服务器错误', 500);
    }
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body) {
      return error(res, '请求体格式错误');
    }

    const { username, password, student_no, name, gender, age, class_name, major } = body;

    if (!username || !password) {
      return error(res, '用户名和密码不能为空');
    }

    if (password.length < 6) {
      return error(res, '密码长度不能少于 6 位');
    }

    try {
      const existing = await sql`SELECT id FROM students WHERE username = ${username}`;
      if (existing.length > 0) {
        return error(res, '用户名已存在');
      }

      if (student_no) {
        const dupNo = await sql`SELECT id FROM students WHERE student_no = ${student_no}`;
        if (dupNo.length > 0) {
          return error(res, '学号已存在');
        }
      }

      const passwordHash = await hashPassword(password);
      const ageVal = age !== undefined && age !== '' && age !== null ? parseInt(age, 10) : null;

      const rows = await sql`
        INSERT INTO students (username, password_hash, student_no, name, gender, age, class_name, major)
        VALUES (
          ${username},
          ${passwordHash},
          ${student_no || null},
          ${name || null},
          ${gender || null},
          ${ageVal},
          ${class_name || null},
          ${major || null}
        )
        RETURNING id, username, student_no, name, gender, age, class_name, major, created_at, updated_at
      `;

      return success(res, formatStudent(rows[0]), 201);
    } catch (err) {
      console.error('Create student error:', err);
      return error(res, '服务器错误', 500);
    }
  }

  return error(res, '方法不允许', 405);
};
