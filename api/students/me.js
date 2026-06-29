const { getSql } = require('../lib/db');
const { requireAuth } = require('../lib/auth');
const { success, error } = require('../lib/response');

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
  if (req.method !== 'GET') {
    return error(res, '方法不允许', 405);
  }

  const authResult = requireAuth(req, ['student']);
  if (authResult.error) {
    return error(res, authResult.error, authResult.status);
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, username, student_no, name, gender, age, class_name, major, created_at, updated_at
      FROM students
      WHERE id = ${authResult.user.id}
    `;

    if (rows.length === 0) {
      return error(res, '学生信息不存在', 404);
    }

    return success(res, formatStudent(rows[0]));
  } catch (err) {
    console.error('Get own student error:', err);
    return error(res, '服务器错误', 500);
  }
};
