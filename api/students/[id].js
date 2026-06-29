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

  const id = parseInt(req.query.id, 10);
  if (!id || Number.isNaN(id)) {
    return error(res, '无效的学生 ID');
  }

  const sql = getSql();

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, username, student_no, name, gender, age, class_name, major, created_at, updated_at
        FROM students WHERE id = ${id}
      `;
      if (rows.length === 0) {
        return error(res, '学生不存在', 404);
      }
      return success(res, formatStudent(rows[0]));
    } catch (err) {
      console.error('Get student error:', err);
      return error(res, '服务器错误', 500);
    }
  }

  if (req.method === 'PUT') {
    const body = parseBody(req);
    if (!body) {
      return error(res, '请求体格式错误');
    }

    const { username, password, student_no, name, gender, age, class_name, major } = body;

    try {
      const existing = await sql`SELECT id FROM students WHERE id = ${id}`;
      if (existing.length === 0) {
        return error(res, '学生不存在', 404);
      }

      if (username) {
        const dupUser = await sql`
          SELECT id FROM students WHERE username = ${username} AND id != ${id}
        `;
        if (dupUser.length > 0) {
          return error(res, '用户名已存在');
        }
      }

      if (student_no) {
        const dupNo = await sql`
          SELECT id FROM students WHERE student_no = ${student_no} AND id != ${id}
        `;
        if (dupNo.length > 0) {
          return error(res, '学号已存在');
        }
      }

      const current = await sql`
        SELECT username, student_no, name, gender, age, class_name, major, password_hash
        FROM students WHERE id = ${id}
      `;
      const cur = current[0];

      const newUsername = username !== undefined ? username : cur.username;
      const newStudentNo = student_no !== undefined ? (student_no || null) : cur.student_no;
      const newName = name !== undefined ? (name || null) : cur.name;
      const newGender = gender !== undefined ? (gender || null) : cur.gender;
      const newAge = age !== undefined
        ? (age !== '' && age !== null ? parseInt(age, 10) : null)
        : cur.age;
      const newClassName = class_name !== undefined ? (class_name || null) : cur.class_name;
      const newMajor = major !== undefined ? (major || null) : cur.major;

      let newPasswordHash = cur.password_hash;
      if (password) {
        if (password.length < 6) {
          return error(res, '密码长度不能少于 6 位');
        }
        newPasswordHash = await hashPassword(password);
      }

      const rows = await sql`
        UPDATE students SET
          username = ${newUsername},
          password_hash = ${newPasswordHash},
          student_no = ${newStudentNo},
          name = ${newName},
          gender = ${newGender},
          age = ${newAge},
          class_name = ${newClassName},
          major = ${newMajor},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, username, student_no, name, gender, age, class_name, major, created_at, updated_at
      `;

      return success(res, formatStudent(rows[0]));
    } catch (err) {
      console.error('Update student error:', err);
      return error(res, '服务器错误', 500);
    }
  }

  if (req.method === 'DELETE') {
    try {
      const rows = await sql`
        DELETE FROM students WHERE id = ${id}
        RETURNING id
      `;
      if (rows.length === 0) {
        return error(res, '学生不存在', 404);
      }
      return success(res, { id });
    } catch (err) {
      console.error('Delete student error:', err);
      return error(res, '服务器错误', 500);
    }
  }

  return error(res, '方法不允许', 405);
};
