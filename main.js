// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('node:path');
const fs = require('fs');

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('getTasks', () => {
    const jsonPath = path.join(__dirname, 'package.json');
    let json;
    if (fs.existsSync(jsonPath)) {
      json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    }
    const filteredKeys =
      json &&
      Object.keys(json.scripts).filter(
        (key) => key.includes('watch-') || key.includes('dev-')
      );
    return filteredKeys || [];
  });

  ipcMain.handle('writeTasks', (event, tasks) => {
    const initialBuild = {
      version: '2.0.0',
      tasks: [],
    };

    const combiner = {
      label: 'Run build',
      group: 'build',
      dependsOn: tasks,
    };

    tasks.forEach((task) => {
      initialBuild.tasks.push({type: 'npm', script: task, label: task});
    });

    initialBuild.tasks.push(combiner);

    const filePath = path.join(__dirname, '.vscode', 'tasks.json');
    if (fs.existsSync(filePath))
      fs.writeFileSync(filePath, JSON.stringify(initialBuild, undefined, 2));
  });

  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
