const { contextBridge, ipcRenderer } = require('electron');

// Expose a function to send a silent-print ipc message to the Electron main process.
// This will be used as window.electron.printSilently() in the rendering process.
contextBridge.exposeInMainWorld('electron', {
  printSilently: () => new Promise((res, fail) => {
    ipcRenderer.send('silent-print');
    ipcRenderer.once('silent-print-result', (event, result) => {
      result === 'success' ? res() : fail(result);
    });
  })
});
