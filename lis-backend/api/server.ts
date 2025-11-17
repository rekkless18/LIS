/**
 * local server entry file, for local development
 */
/**
 * 功能描述：服务启动入口，读取端口并启动Express应用，监听系统信号安全关闭
 * 参数说明：
 *  - 环境变量 PORT：服务端口号，默认3001
 * 返回值类型及用途：
 *  - 导出 app（Express 应用），用于开发环境调试
 */
import app from './app.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

/**
 * 功能描述：启动HTTP服务并打印启动日志
 * 参数说明：无
 * 返回值类型及用途：
 *  - server：HTTPServer实例，用于接收信号关闭
 */
const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 * 功能：处理SIGTERM与SIGINT信号，优雅关闭服务
 * 参数说明：无
 * 返回值类型及用途：无；用于保障进程安全退出
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;