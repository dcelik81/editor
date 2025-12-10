import { SyntaxStrategy } from './SyntaxStrategy';
import { JavascriptSyntaxStrategy } from './JavascriptSyntaxStrategy';
import { AssemblySyntaxStrategy } from './AssemblySyntaxStrategy';
import { TxtSyntaxStrategy } from './TxtSyntaxStrategy';
import { JavaSyntaxStrategy } from './JavaSyntaxStrategy';

export class SyntaxFactory {
    public static createSyntaxStrategy(fileName: string): SyntaxStrategy {
        let strategy: SyntaxStrategy;

        if (
            fileName.endsWith('.js') ||
            fileName.endsWith('.jsx') ||
            fileName.endsWith('.ts') ||
            fileName.endsWith('.tsx')
        ) {
            strategy = new JavascriptSyntaxStrategy();
        } else if (fileName.endsWith('.asm') || fileName.endsWith('.s')) {
            strategy = new AssemblySyntaxStrategy();
        } else if (fileName.endsWith('.txt')) {
            strategy = new TxtSyntaxStrategy();
        } else if (fileName.endsWith('.java')) {
            strategy = new JavaSyntaxStrategy();
        } else {
            strategy = new TxtSyntaxStrategy();
        }

        return strategy;
    }
}
