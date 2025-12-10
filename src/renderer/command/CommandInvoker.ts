import { Command } from './Command';

export class CommandInvoker {
    async executeCommand(command: Command) {
        // İleride loglama veya geri alma (undo) işlemleri buraya eklenebilir
        await command.execute();
    }
}
