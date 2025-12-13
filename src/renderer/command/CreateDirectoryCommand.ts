import { Command } from './Command';

export class CreateDirectoryCommand implements Command {
    private dirPath: string;

    constructor(dirPath: string) {
        this.dirPath = dirPath;
    }

    async execute(): Promise<void> {
        console.log(`Command: Klasör oluşturuluyor -> ${this.dirPath}`);
        const success = await window.electron.files.createDir(this.dirPath);
        if (success) {
            console.log('✅ Klasör oluşturuldu.');
        } else {
            console.error('❌ Klasör oluşturulamadı (veya zaten var).');
        }
    }
}
