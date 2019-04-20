// Keeps track of where a log comes from.  Pretty useful to keep long term.
["log", "warn"].forEach(function(method) {
  var old = console[method];
  console[method] = function() {
    var stack = new Error().stack.split(/\n/);
    // Chrome includes a single "Error" line, FF doesn't.
    if (stack[0].indexOf("Error") === 0) {
      stack = stack.slice(1);
    }
    var args = [].slice.apply(arguments).concat([stack[1].trim()]);
    return old.apply(console, args);
  };
});

const { HOTSPromise } = require("./electron/startup.js");
const chokidar = require("chokidar");
const electron = require("electron");
const fs = require("fs");
const path = require("path");
const url = require("url");
const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  globalShortcut,
  protocol,
} = electron;
const dataPath = app.getPath("userData");
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
const windowStateKeeper = require("electron-window-state");
const { parseNewReplays } = require("./electron/parser/parsingManager.js");
const replaySummaries = path.join(dataPath, "replaySummaries.json");
const {
  showParsingMenu,
  parserPopup,
  saveSaveInfo,
} = require("./electron/containers/parsingLogger/parseAndUpdateManager.js");
const {
  previewWindow,
} = require("./electron/containers/preview/previewManager.js");
const {
  options,
  optionsPopup,
  loadOptionsMenu,
  addNewAccount,
} = require("./electron/containers/optionsMenu/optionsManager.js");
const {
  loadPreviewWindow,
} = require("./electron/containers/preview/previewManager.js");
const { returnIDs } = require("./electron/parser/bareLobby.js");
require("electron-context-menu")();
// require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })

process.on("dispatchSingleReplay", replay => {
  // THIS IS FOR USER SPECIFIED REPLAY FILES - BASICALLY FOR YOU TO ANALYZE A REPLAY IN MORE DETAIL IF NECESSARY
  mainWindow.webContents.send("dispatchSingleReplay", replay);
});

ipcMain.on("parser:toggle", (e, args) => {
  if (parserPopup.parserWindow.isVisible()) parserPopup.parserWindow.hide();
  else {
    parserPopup.parserWindow.webContents.send(
      "parsing",
      parserPopup.saveInfo.files
    );
    parserPopup.parserWindow.show();
  }
});

ipcMain.on("loadPlayer", (e, playerID) => {
  mainWindow.webContents.send("loadPlayer", playerID);
  mainWindow.focus();
});

ipcMain.on("options:toggle", (e, args) => {
  if (optionsPopup.window.isVisible()) optionsPopup.window.hide();
  else {
    optionsPopup.window.show();
  }
});

ipcMain.on("request:replay", (e, MSL) => {
  fs.readFile(
    path.join(path.join(dataPath, "replays", `${MSL}.json`)),
    (e, replay) => {
      if (e) return console.log(e);
      mainWindow.webContents.send("send:replay", JSON.parse(replay));
    }
  );
});

process.on("dispatchReplays", replays => {
  console.log(`Should be sending ${replays.length} replays to main window`);
  mainWindow.webContents.send("replays:dispatch", replays);
});

process.on("newaccount:send", ({ bnetID, region, handle }) => {
  mainWindow.webContents.send("playerInfo:dispatch", {
    bnetIDs: options.bnetIDs,
    handles: options.handles,
    regions: options.regions,
  });
});

process.on("replays:refresh", nothing => {
  setTimeout(() => {
    mainWindow.webContents.send("replays:finishedSending", null);
  }, 250);
});

let tray;
function createTray() {
  console.log(process.env.ELECTRON_START_URL, "start url");
  const trayPath = process.env.ELECTRON_START_URL
    ? "tinyTray.png"
    : path.join(__dirname, "/../build/tinyTray.png");
  tray = new Tray(trayPath);
  tray.setToolTip("Heroes Report Replay Analyzer");
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "Toggle Parsing and Uploading Menu",
      click(item, focusedWindow) {
        toggleWindow(parserPopup.parserWindow);
      },
      accelerator: "CommandOrControl+U",
    },
    {
      label: "Toggle Preview Menu",
      click(item, focusedWindow) {
        toggleWindow(previewWindow.window);
      },
      accelerator: "CommandOrControl+P",
    },
    {
      label: "Toggle Options Menu",
      click(item, focusedWindow) {
        toggleWindow(optionsPopup.window);
      },
      accelerator: "CommandOrControl+O",
    },
    {
      label: "Toggle Debug Consoles",
      click(item, focusedWindow) {
        for (let w = 0; w < 4; w++)
          [
            parserPopup.parserWindow,
            optionsPopup.window,
            previewWindow.window,
            mainWindow,
          ][w].toggleDevTools();
      },
      accelerator: "CommandOrControl+D",
    },
    { role: "quit" },
  ]);
  tray.setContextMenu(trayMenu);
}
let mainWindow; // Keep a global reference of the window object OR GC
// console.log(process.getProcessMemoryInfo())

const battleLobbyResults = {
  handles: [
    "MaxPower",
    "HappyPants",
    "Zero",
    "Iamsquirtle",
    "Demian",
    "baobabe",
    "Pochiking",
    "MightyBeast",
    "Chasanak",
    "ElRickJames",
  ],
  teamNumbers: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  battleTags: [
    "1348",
    "1918",
    "14616",
    "1203",
    "1705",
    "1685",
    "1909",
    "17660",
    "1357",
    "1854",
  ],
};

const getPreviewFromPath = function(path) {
  try {
    let file = fs.readFileSync(path);
    let results = returnIDs(file.toString());
    mainWindow.webContents.send("getPreviewPlayerInfo", results);
  } catch (e) {
    console.log(e, "Problem with preview info");
  }
};

const monitorForLobby = function() {
  // This is for testing purposes only.  Delete it when everything is ready.
  // setTimeout(() => { mainWindow.webContents.send('getPreviewPlayerInfo',battleLobbyResults) }, 4000)
  // getPreviewFromPath('./public/replay.server.battlelobby')
  // main window is already loaded when calling this function
  const tempPath = path.join(app.getPath("temp"), "Heroes of the Storm");
  console.log(`Should be watching ${tempPath} for previews...`);
  const watcher = chokidar.watch(tempPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });
  watcher.on("ready", () =>
    watcher.on("add", path => {
      if (path.includes("replay.server.battlelobby")) {
        setTimeout(async () => {
          getPreviewFromPath(path);
        }, 250);
      }
    })
  );
};

process.on("monitorAccount", newAccount => {
  console.log(newAccount);
  monitorAccount(newAccount);
});

const monitorAccount = function(account) {
  const { replayPath, renameFiles } = account;
  const watcher = chokidar.watch(replayPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });
  watcher.on("ready", () =>
    watcher.on("add", path => {
      const parts = path.split(".");
      if (parts[parts.length - 1] !== "StormReplay") {
        console.log("not a complete replay!", path);
        return;
      }
      if (!parserPopup.saveInfo.fileNames.hasOwnProperty(path)) {
        setTimeout(() => {
          process.emit("addSingleReplay", { rPath: path, renameFiles });
        }, 2000); // after 2 seconds, send file info to parser.  Should be enough time, and half a second MAY have been causing issues before
      }
    })
  );
  parseNewReplays(account, true);
};

function createWindow() {
  let winState = windowStateKeeper({ defaultWidth: 1200, defaultHeight: 600 });
  mainWindow = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    minWidth: 825,
    minHeight: 480,
    frame: false,
    standardWindow: false,
    show: false,
    webPreferences: { webSecurity: false },
  });
  mainWindow.once("ready-to-show", async () => {
    if (options.accounts.length) {
      options.accounts.forEach(account => {
        monitorAccount(account);
      });
      // call parser and do normal startup stuff
    } else {
      let account = await addNewAccount();
      monitorAccount(account);
    }
    monitorForLobby();
    if (fs.existsSync(replaySummaries)) {
      fs.readFile(replaySummaries, async (e, summaries) => {
        summaries = JSON.parse(`[${summaries.slice(0, summaries.length - 1)}]`);
        const HOTS = await HOTSPromise;
        setTimeout(() => {
          mainWindow.webContents.send("replays:finishedSending", null);
        }, 250);
        for (let r = 0; r < summaries.length; r++) {
          let rep = summaries[r];
          for (let t = 0; t < 7; t++) {
            let tal = rep.fullTals[t];
            if (tal && isNaN(tal)) {
              if (HOTS.talentN.hasOwnProperty(tal))
                summaries[r].fullTals[t] = HOTS.talentN[tal];
              else summaries[r].fullTals[t] = null;
            }
          }
          for (let h = 0; h < 10; h++) {
            const hero = rep.h[h];
            for (let t = 30; t < 44; t += 2) {
              const tal = hero[t];
              if (tal && isNaN(tal)) {
                if (HOTS.talentN.hasOwnProperty(tal))
                  summaries[r].h[h][t] = HOTS.talentN[tal];
                else summaries[r].h[h][t] = undefined;
              }
            }
          }
        }
        mainWindow.webContents.send("replays:dispatch", summaries);
        // showing the main window after all of this is done makes the program FEEL less laggy
        setTimeout(() => {
          if (loadingWindow) {
            loadingWindow.close();
            loadingWindow.destroy();
          }
          mainWindow.show();
        }, 1000);
      });
    } else mainWindow.show();
  });
  winState.manage(mainWindow);
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "/../build/index.html"),
      protocol: "file:",
      slashes: true,
    });

  mainWindow.loadURL(startUrl);
  showParsingMenu();
  loadOptionsMenu(options);

  // The below, interrupting other window shutdowns with hides, has to be done in the main process HERE.  Otherwise, it will be called asynchronously (after the window has closed)
  for (let w = 0; w < 2; w++) {
    let window = [parserPopup.parserWindow, optionsPopup.window][w];
    window.on("close", function(event) {
      console.log(global["quitting"]);
      if (global["quitting"]) {
        console.log("quitting...");
        return;
      }
      event.preventDefault();
      if (window.isVisible()) window.hide();
      else window.show();
    });
  }

  mainWindow.webContents.on("did-finish-load", async () => {
    mainWindow.webContents.send("playerInfo:dispatch", {
      bnetIDs: options.bnetIDs,
      handles: options.handles,
      regions: options.regions,
    });
  });
  createTray();
  mainWindow.on("closed", function(event) {
    console.log("closing main window...");
    // Dereference the window object, usually you would store windows in an array if your app supports multi windows
    saveSaveInfo();
    mainWindow = null;
    for (let w = 0; w < 2; w++)
      [parserPopup.parserWindow, optionsPopup.window][w] = null;
    tray.destroy();
    // need to shutdown uploader and parsers, too...
    global["quitting"] = true;
    app.quit();
  });
}

let loadingWindow;
function showLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 340,
    height: 225,
    resizable: true,
    frame: false,
    standardWindow: false,
    show: false,
  });
  loadingWindow.once("ready-to-show", async () => {
    loadingWindow.show();
    loadPreviewWindow();
    createWindow();
  });
  const loadingURL = process.env.ELECTRON_START_URL
    ? path.join(process.env.ELECTRON_START_URL, "loading")
    : url.format({
        pathname: path.join(__dirname, "/../build/loading.html"),
        protocol: "file:",
        slashes: true,
      });
  loadingWindow.loadURL(loadingURL);
}

const toggleWindow = window => {
  if (window.isVisible()) window.hide();
  else window.show();
};
// This method will be called when Electron has finished initialization and is ready to create browser windows.
app.on("ready", () => {
  protocol.interceptFileProtocol("file", (request, callback) => {
    const url = request.url.substr(7);
    const args = { path: path.normalize(`${__dirname}/${url}`) };
  });
  showLoadingWindow();
  globalShortcut.register("CommandOrControl+D", () => {
    for (let w = 0; w < 4; w++)
      [
        parserPopup.parserWindow,
        optionsPopup.window,
        previewWindow.window,
        mainWindow,
      ][w].toggleDevTools();
  });
  globalShortcut.register("CommandOrControl+P", () => {
    toggleWindow(previewWindow.window);
  });
  globalShortcut.register("CommandOrControl+U", () => {
    toggleWindow(parserPopup.parserWindow);
  });
  globalShortcut.register("CommandOrControl+O", () => {
    toggleWindow(optionsPopup.window);
  });
});

app.on("quit", function() {
  console.log("ev:app quit");
  app.exit(0);
});

app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar to not quit without CMD+Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // re-create a window in OSX when the dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
