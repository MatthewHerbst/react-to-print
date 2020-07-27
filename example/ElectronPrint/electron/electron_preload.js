const { contextBridge, ipcRenderer } = require('electron');

// Expose a function to send a silent-print ipc message to the Electron main process.
// This will be used as window.electron.printSilently() in the rendering process.
contextBridge.exposeInMainWorld('electron', {
  printSilently: () => ipcRenderer.invoke('silent-print'),
});
