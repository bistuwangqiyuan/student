const { initializeDatabase } = require('./lib/init');
const { success, error } = require('./lib/response');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return error(res, '方法不允许', 405);
  }

  const initSecret = process.env.INIT_SECRET;
  if (initSecret) {
    const provided = req.headers['x-init-secret'] || req.query.secret;
    if (provided !== initSecret) {
      return error(res, '无权访问', 403);
    }
  }

  try {
    const result = await initializeDatabase();
    return success(res, result);
  } catch (err) {
    console.error('Init DB error:', err);
    return error(res, '数据库初始化失败: ' + err.message, 500);
  }
};
