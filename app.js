const electron = require('electron')
// Module to control application life.
const { app, Menu, BrowserWindow } = electron
const path = require('path')
const url = require('url')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainScreenSize;


function createWindow() {
    let display = electron.screen.getPrimaryDisplay();
    mainScreenSize = display.size;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        center: true,

        minWidth: 1024, minHeight: 576,
        //x: mainScreenSize.width - 200, y: mainScreenSize.height - 440,
        minimizable: true,
        maximizable: true,
        //maximizable: true,
        // 1. Remove the frame of the window
        frame: true,
        //fullscreenable: true,
        //transparent: true,
        //resizable: true,
        fullscreen: false,
        //titleBarStyle: "hidden",
        webPreferences: {
            //preload: path.join(__dirname , 'preload.js'),
            // 2. Enable Node.js integration
            nodeIntegration: true
        }
    })



    //mainWindow.setMenuBarVisibility(true)

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname + '/app', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.