const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('zcodeApi', {
  state: () => ipcRenderer.invoke('state'),
  list: () => ipcRenderer.invoke('list'),
  quota: (id) => ipcRenderer.invoke('quota', id),
  switchAccount: (id) => ipcRenderer.invoke('switch', id),
  capture: (name) => ipcRenderer.invoke('capture', name),
  remove: (id) => ipcRenderer.invoke('remove', id),
  rename: (id, name) => ipcRenderer.invoke('rename', id, name),
  openManager: () => ipcRenderer.invoke('openManager'),
  openDataDir: () => ipcRenderer.invoke('openDataDir'),
  launchZcode: () => ipcRenderer.invoke('launchZcode'),
  exportAll: (password) => ipcRenderer.invoke('exportAll', password),
  importBundle: (password) => ipcRenderer.invoke('importBundle', password),
});
