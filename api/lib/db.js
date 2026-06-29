const { neon } = require('@neondatabase/serverless');

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未配置');
  }
  return neon(process.env.DATABASE_URL);
}

module.exports = { getSql };
