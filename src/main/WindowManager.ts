import { BrowserWindow, app, shell } from 'electron';
import path from 'path';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

export default class WindowManager {
    private mainWindow: BrowserWindow | null = null;

    constructor() {}

    public async createWindow(): Promise<void> {
        const RESOURCES_PATH = app.isPackaged
            ? path.join(process.resourcesPath, 'assets')
            : path.join(__dirname, '../../assets');

        const getAssetPath = (...paths: string[]): string => {
            return path.join(RESOURCES_PATH, ...paths);
        };

        this.mainWindow = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            icon: getAssetPath('icon.png'),
            webPreferences: {
                preload: app.isPackaged
                    ? path.join(__dirname, 'preload.js')
                    : path.join(__dirname, '../../.erb/dll/preload.js'),
            },
        });

        this.mainWindow.loadURL(resolveHtmlPath('index.html'));

        this.mainWindow.on('ready-to-show', () => {
            if (!this.mainWindow) {
                throw new Error('"mainWindow" is not defined');
            }
            if (process.env.START_MINIMIZED) {
                this.mainWindow.minimize();
            } else {
                this.mainWindow.show();
            }
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        const menuBuilder = new MenuBuilder(this.mainWindow);
        menuBuilder.buildMenu();

        // Open urls in the user's browser
        this.mainWindow.webContents.setWindowOpenHandler((edata) => {
            shell.openExternal(edata.url);
            return { action: 'deny' };
        });
    }

    public getWindow(): BrowserWindow | null {
        return this.mainWindow;
    }
}
