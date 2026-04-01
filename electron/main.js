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
    title: 'DevFlow Engine',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 加载 Dashboard
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // 生产环境：先启动 Server，然后加载静态文件
    startServer();
    mainWindow.loadFile(path.join(__dirname, '..', 'web-static', 'index.html'));
    // 或连接到本地 Server
    // mainWindow.loadURL('http://localhost:3000');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  const serverPath = path.join(__dirname, '..', 'server', 'index.js');
  serverProcess = spawn('node', [serverPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
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