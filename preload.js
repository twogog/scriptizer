// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('getTasks'),
  writeTasks: (tasks) => ipcRenderer.invoke('writeTasks', tasks),
  loger: () => ipcRenderer.invoke('loger'),
});
