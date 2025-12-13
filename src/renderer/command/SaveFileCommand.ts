import { Command } from './Command';

export class SaveFileCommand implements Command {
    private filePath: string;
    private content: string;

    constructor(filePath: string, content: string) {
        this.filePath = filePath;
        this.content = content;
    }

    async execute(): Promise<void> {
        console.log(`💾 Command: Kaydediliyor -> ${this.filePath}`);
        try {
            const success = await window.electron.files.saveFile(
                this.filePath,
                this.content,
            );
            if (success) {
                console.log('✅ Dosya kaydedildi.');
            } else {
                console.error('❌ Kayıt hatası.');
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    }
}
