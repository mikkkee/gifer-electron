"use strict";

const electron = require("electron");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
// Module to listen to msgs.
const ipc = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow,
  pids = [];

function CreateWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: process.env.NODE_ENV === "development" ? 1400 : 900,
    height: 760,
    webPreferences: {
      nodeIntegration: true,
      devTools: process.env.NODE_ENV === "development",
    },
  });
  // Disable default menu at start.
  const menu = new Menu();
  mainWindow.setMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL("file://" + __dirname + "/index.html");
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// Listen to FFMPEG begin and end events.
function CreateFFMPEGListeners() {
  ipc.on("ffmpeg-begin", function (event, arg) {
    console.log("ffmpeg-begin ", arg);
    pids.push(arg);
  });
  ipc.on("ffmpeg-end", function (event, arg) {
    console.log("ffmpeg-end ", arg);
    if (pids.indexOf(arg) > -1) pids.splice(pids.indexOf(arg), 1);
  });
}

// Kill running FFMPEG process.
function KillFFMPEG() {}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", function () {
  CreateWindow();
  CreateFFMPEGListeners();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Kill all subprocesses when quiting.
app.on("will-quit", function () {
  KillFFMPEG();
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    CreateWindow();
  }
});
