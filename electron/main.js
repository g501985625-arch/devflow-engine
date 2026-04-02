const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let serverStarted = false;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'DevFlow Engine Dashboard',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 生产模式：直接加载打包后的静态文件
  // 开发模式通过 NODE_ENV=development 环境变量控制
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 开发模式：连接本地 Vite server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的静态文件
    const staticPath = path.join(__dirname, '..', 'dist', 'web-static', 'index.html');
    mainWindow.loadFile(staticPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startServer() {
  if (serverStarted) return;
  
  try {
    // 动态导入服务器模块
    const serverPath = path.join(__dirname, '..', 'dist', 'server', 'index.js');
    const { createServer } = require(serverPath);
    
    await createServer({
      port: 3000,
      host: 'localhost'
    });
    
    serverStarted = true;
    console.log('DevFlow Server started on port 3000');
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

app.whenReady().then(async () => {
  await startServer();
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});