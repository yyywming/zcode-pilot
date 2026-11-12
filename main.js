const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let win = null;
let tray = null;
let quitting = false;

function enginePath() {
  return app.isPackaged ? path.join(process.resourcesPath, 'zcode-switch.exe') : path.join(__dirname, 'resources', 'zcode-switch.exe');
}

function runCli(args, env = {}, timeoutMs = 120000) {
  return new Promise((resolve) => {
    const exe = enginePath();
    const child = spawn(exe, ['--cli', ...args], {
      windowsHide: true,
      env: { ...process.env, ...env },
    });
    let out = '', err = '';
    const timer = setTimeout(() => { try { child.kill(); } catch {} }, timeoutMs);
    child.stdout.on('data', (d) => { out += d.toString('utf8'); });
    child.stderr.on('data', (d) => { err += d.toString('utf8'); });
    child.on('close', (code) => {
      clearTimeout(timer);
      let data = null;
      try { data = JSON.parse(out); } catch {}
      if (!data) {
        resolve({ ok: false, error: (err || out || '引擎无输出').trim(), code });
      } else if (code !== 0 && data.ok !== false) {
        resolve({ ...data, ok: false, error: data.error || err || `退出码 ${code}`, code });
      } else {
        resolve({ ...data, code });
      }
    });
    child.on('error', (e) => { clearTimeout(timer); resolve({ ok: false, error: e.message }); });
  });
}

function showWindow() { if (!win) return; if (win.isMinimized()) win.restore(); win.show(); win.focus(); }

function createWindow() {
  win = new BrowserWindow({
    width: 1180, height: 820, minWidth: 980, minHeight: 640,
    backgroundColor: '#0b1220', title: 'ZCode Pilot',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
  win.on('close', (e) => { if (!quitting) { e.preventDefault(); win.hide(); } });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'build', 'icon.ico'));
  tray.setToolTip('ZCode Pilot');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开面板', click: showWindow },
    { label: '打开 ZCode 管理器', click: () => spawn(enginePath(), [], { windowsHide: false, detached: true }).unref() },
    { type: 'separator' },
    { label: '退出', click: () => { quitting = true; app.quit(); } },
  ]));
  tray.on('click', showWindow);
}

ipcMain.handle('state', () => runCli(['state']));
ipcMain.handle('list', () => runCli(['list']));
ipcMain.handle('quota', (_e, id) => runCli(id ? ['quota', '--id', id] : ['quota']));
ipcMain.handle('switch', (_e, id) => runCli(['switch', '--id', id]));
ipcMain.handle('capture', (_e, name) => runCli(name ? ['capture', '--name', name] : ['capture']));
ipcMain.handle('remove', (_e, id) => runCli(['delete', '--id', id]));
ipcMain.handle('rename', (_e, id, name) => runCli(['rename', '--id', id, '--name', name]));
ipcMain.handle('openManager', () => { spawn(enginePath(), [], { windowsHide: false, detached: true }).unref(); return { ok: true }; });
ipcMain.handle('openDataDir', () => { shell.openPath(path.join(app.getPath('home'), '.zcode-switch')); return { ok: true }; });
ipcMain.handle('launchZcode', () => runCli(['launch']));
ipcMain.handle('exportAll', async (_e, password) => {
  const r = await dialog.showSaveDialog(win, { title: '导出全部账号', defaultPath: `zcode-accounts-${Date.now()}.zsb`, filters: [{ name: 'ZCode Bundle', extensions: ['zsb'] }] });
  if (r.canceled || !r.filePath) return { ok: false, canceled: true };
  return runCli(['export-all', '--out', r.filePath], { ZSW_PASSWORD: password });
});
ipcMain.handle('importBundle', async (_e, password) => {
  const r = await dialog.showOpenDialog(win, { title: '导入账号包', properties: ['openFile'], filters: [{ name: 'ZCode Bundle', extensions: ['zsb'] }] });
  if (r.canceled || !r.filePaths[0]) return { ok: false, canceled: true };
  return runCli(['import', '--file', r.filePaths[0]], { ZSW_PASSWORD: password });
});

app.setAppUserModelId('com.yyywming.zcodepilot');
if (!app.requestSingleInstanceLock()) app.quit();
else app.on('second-instance', showWindow);
app.on('before-quit', () => { quitting = true; });
app.on('window-all-closed', (e) => { e.preventDefault(); });
app.whenReady().then(() => { createWindow(); createTray(); });
