const { getSql } = require('../../lib/db');
const { hashPassword, signToken } = require('../../lib/auth');
const { success, error, parseBody } = require('../../lib/response');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return error(res, '方法不允许', 405);
  }

  const body = parseBody(req);
  if (!body) {
    return error(res, '请求体格式错误');
  }

  const { username, password } = body;
  if (!username || !password) {
    return error(res, '用户名和密码不能为空');
  }

  if (username.length < 3 || username.length > 50) {
    return error(res, '用户名长度需在 3-50 个字符之间');
  }

  if (password.length < 6) {
    return error(res, '密码长度不能少于 6 位');
  }

  try {
    const sql = getSql();
    const existing = await sql`SELECT id FROM students WHERE username = ${username}`;
    if (existing.length > 0) {
      return error(res, '用户名已被注册');
    }

    const passwordHash = await hashPassword(password);
    const rows = await sql`
      INSERT INTO students (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username
    `;

    const student = rows[0];
    const token = signToken({ id: student.id, username: student.username, role: 'student' });
    return success(res, { token, username: student.username, role: 'student' }, 201);
  } catch (err) {
    console.error('Student register error:', err);
    return error(res, '服务器错误', 500);
  }
};
