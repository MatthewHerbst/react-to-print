const {
  app, BrowserWindow, protocol, ipcMain
} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;

/**
 * Create Electron window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    show: false,
    // These webPreferences keep your application secure
    // while exposing the mini printing API
    webPreferences: {
      nodeIntegrationInSubFrames: true, // allow preloading in iframes
      nodeIntegration: false, // disable NodeJS functionality in the renderers
      contextIsolation: true, // ensure the renderer cannot peek into main process
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'electron_preload.js'),
    },
  });

  // Remove the menu bar (on Windows anyway) if not running in debug mode
  if (!(process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true')) {
    mainWindow.removeMenu();
  }

  // Open new silent printer windows hidden
  mainWindow.webContents.on("new-window", function (e, url, frameName, disposition, options) {
    if (frameName === 'silent-print-content') {
      options.show = false
    }
  })

  // Load the localhost React server in development
  // environments, otherwise load the built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080/');
  } else {
    // Semi-ugly hack so Electron can find your build files, in this case
    // assuming electron.js is in this example folder, and the built
    // files are available in the dist folder in the project root
    protocol.interceptFileProtocol('file', (request, callback) => {
      callback({path: path.normalize(path.join(__dirname, '../../../dist/', request.url.substr(7)))});
    });

    // Load index.html to start the React application
    mainWindow.loadURL(url.format({
      pathname: 'index.html',
      protocol: 'file',
      slashes: true,
    }));
  }

  // Only show the window when it is ready to be shown
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Remove reference to the window when it's closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Prevent closing the application on Mac OS when the last
// window is closed, since the menu bar is still open and
// is sometimes used to create a new window
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  createWindow();

  // Add a handler for the silent-print ipc message
  ipcMain.on('', (event) => {
    event.reply
  })
  ipcMain.on('silent-print', (event) => {
    // Print the window silently
    event.sender.print({silent: true}, (success, failureReason) => {
      // Signal that the print is finished
      event.reply('silent-print-result', success ? 'success' : failureReason);
    });
  });
});
