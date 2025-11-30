import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import WindowManager from './WindowManager';
import IpcService from './IpcService';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export default class Application {
  private windowManager: WindowManager;
  private ipcService: IpcService;

  constructor() {
    this.windowManager = new WindowManager();
    this.ipcService = new IpcService();
    this.init();
  }

  private init() {
    if (process.env.NODE_ENV === 'production') {
      const sourceMapSupport = require('source-map-support');
      sourceMapSupport.install();
    }

    const isDebug =
      process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    if (isDebug) {
      require('electron-debug').default();
    }

    app.on('window-all-closed', () => {
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app
      .whenReady()
      .then(async () => {
        if (isDebug) {
          await this.installExtensions();
        }
        
        await this.windowManager.createWindow();
        
        // Remove this if your app does not use auto updates
        // eslint-disable-next-line
        new AppUpdater();

        app.on('activate', () => {
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (this.windowManager.getWindow() === null) {
            this.windowManager.createWindow();
          }
        });
      })
      .catch(console.log);
  }

  private async installExtensions() {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload,
      )
      .catch(console.log);
  }
}
