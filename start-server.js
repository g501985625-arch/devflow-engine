/**
 * DevFlow Server 启动脚本
 */

const { createServer, DEFAULT_SERVER_CONFIG } = require('./dist/server/index.js');
const { DevFlowEngine } = require('./dist/core/Engine.js');

async function main() {
  try {
    console.log('[Server] Initializing DevFlow Engine...');
    
    // 初始化 Engine
    const engine = DevFlowEngine.getInstance();
    await engine.initialize({
      projectPath: process.cwd(),
    });
    
    console.log('[Server] Engine initialized, starting Server...');
    const server = await createServer(DEFAULT_SERVER_CONFIG);
    
    // 处理关闭信号
    process.on('SIGINT', async () => {
      console.log('\n[Server] Shutting down...');
      await server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n[Server] Shutting down...');
      await server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

main();