const { neon } = require('@neondatabase/serverless');

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL
  );
}

function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('数据库连接未配置，请设置 DATABASE_URL 或 POSTGRES_URL');
  }
  return neon(url);
}

module.exports = { getDatabaseUrl, getSql };
