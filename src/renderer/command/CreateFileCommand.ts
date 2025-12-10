import { Command } from './Command';

export class CreateFileCommand implements Command {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async execute(): Promise<void> {
        console.log(`Command: Dosya oluşturuluyor -> ${this.filePath}`);
        // İçi boş bir text dosyası oluşturmak, boş içerik kaydetmekle aynıdır
        await window.electron.files.saveFile(this.filePath, '');
    }
}
