const { getSql } = require('../../lib/db');
const { comparePassword, signToken } = require('../../lib/auth');
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

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, username, password_hash FROM admins WHERE username = ${username}
    `;

    if (rows.length === 0) {
      return error(res, '用户名或密码错误', 401);
    }

    const admin = rows[0];
    const valid = await comparePassword(password, admin.password_hash);
    if (!valid) {
      return error(res, '用户名或密码错误', 401);
    }

    const token = signToken({ id: admin.id, username: admin.username, role: 'admin' });
    return success(res, { token, username: admin.username, role: 'admin' });
  } catch (err) {
    console.error('Admin login error:', err);
    return error(res, '服务器错误', 500);
  }
};
