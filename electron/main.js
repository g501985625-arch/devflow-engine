const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
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

  // 开发模式：连接 Vite dev server
  // 生产模式：加载静态文件
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // 开发模式：连接本地 Vite server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的静态文件
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'web-static', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  // 生产环境启动后端 Server
  const serverPath = path.join(__dirname, '..', 'dist', 'server', 'index.js');
  serverProcess = spawn('node', [serverPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServer();
});