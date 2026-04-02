const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let serverStarted = false;

// 使用 /tmp 作为日志位置，确保能写入
const logPath = '/tmp/devflow-electron.log';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  try {
    fs.appendFileSync(logPath, logMessage);
  } catch (e) {
    console.error('Failed to write log:', e);
  }
}

// 立即写入日志，测试脚本是否执行
log('=== ELECTRON MAIN.JS LOADED ===');

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

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const staticPath = path.join(process.resourcesPath, 'web-static', 'index.html');
    log(`Loading static file from: ${staticPath}`);
    
    if (fs.existsSync(staticPath)) {
      mainWindow.loadFile(staticPath);
      log('Static file loaded successfully');
    } else {
      log(`ERROR: Static file not found at ${staticPath}`);
      const backupPath = path.join(app.getAppPath(), 'dist', 'web-static', 'index.html');
      log(`Trying backup path: ${backupPath}`);
      if (fs.existsSync(backupPath)) {
        mainWindow.loadFile(backupPath);
      }
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startServer() {
  if (serverStarted) return;
  
  try {
    log('Starting server...');
    
    const appPath = app.getAppPath();
    const serverPath = path.join(appPath, 'dist', 'server', 'index.js');
    
    log(`Server path: ${serverPath}`);
    
    const { createServer } = require(serverPath);
    log('Server module loaded successfully');
    
    await createServer({
      port: 3000,
      host: 'localhost'
    });
    
    serverStarted = true;
    log('DevFlow Server started on port 3000');
  } catch (err) {
    log(`Failed to start server: ${err.message}`);
    log(`Stack: ${err.stack}`);
  }
}

app.whenReady().then(async () => {
  // 在 app ready 后初始化日志路径
  logPath = path.join(app.getPath('userData'), 'devflow.log');
  log('App ready');
  log(`__dirname: ${__dirname}`);
  log(`app.getAppPath(): ${app.getAppPath()}`);
  log(`process.resourcesPath: ${process.resourcesPath}`);
  
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