import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import path from 'path';

export default class IpcService {
    constructor() {
        this.registerHandlers();
    }

    private registerHandlers() {
        ipcMain.on('ipc-example', async (event, arg) => {
            const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
            console.log(msgTemplate(arg));
            event.reply('ipc-example', msgTemplate('pong'));
        });

        ipcMain.handle('files:select-directory', async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                properties: ['openDirectory'],
            });
            if (canceled) {
                return;
            } else {
                return filePaths[0];
            }
        });

        ipcMain.handle('files:read-dir', async (event, dirPath) => {
            try {
                const dirents = await fs.promises.readdir(dirPath, {
                    withFileTypes: true,
                });
                return dirents.map((dirent) => ({
                    name: dirent.name,
                    isDirectory: dirent.isDirectory(),
                    path: path.join(dirPath, dirent.name),
                }));
            } catch (err) {
                console.error('Error reading directory:', err);
                return [];
            }
        });

        ipcMain.handle('files:read-file', async (event, filePath) => {
            try {
                const content = await fs.promises.readFile(filePath, 'utf-8');
                return content;
            } catch (err) {
                console.error('Error reading file:', err);
                return '';
            }
        });

        ipcMain.handle(
            'files:save-file',
            async (event, { filePath, content }) => {
                try {
                    await fs.promises.writeFile(filePath, content, 'utf-8');
                    return true;
                } catch (err) {
                    console.error('Error saving file:', err);
                    return false;
                }
            },
        );
    }
}
