const { initializeDatabase } = require('../api/lib/init');
const { getDatabaseUrl } = require('../api/lib/db');

async function main() {
  if (!getDatabaseUrl()) {
    console.error('错误: 请设置 DATABASE_URL 或 POSTGRES_URL 环境变量');
    process.exit(1);
  }

  try {
    const result = await initializeDatabase();
    console.log('✓', result.message);
    console.log('✓ 默认管理员账号: admin / admin');
    console.log('✓ 示例学生账号: zhangsan / 123456, lisi / 123456');
  } catch (err) {
    console.error('初始化失败:', err.message);
    process.exit(1);
  }
}

main();
