import { Extension } from '@codemirror/state';
import { StreamLanguage, StringStream } from '@codemirror/language';
import { SyntaxStrategy } from './SyntaxStrategy';

export class AssemblySyntaxStrategy implements SyntaxStrategy {
    parser = {
        token(stream: StringStream) {
            if (stream.eatSpace()) return null;

            // Comments
            if (stream.peek() === ';' || stream.peek() === '#') {
                stream.skipToEnd();
                return 'comment';
            }

            // Numbers (hex and decimal)
            if (stream.match(/^0x[0-9a-fA-F]+/) || stream.match(/^\d+/)) {
                return 'number';
            }

            // Strings
            if (stream.eat('"')) {
                while (!stream.eol()) {
                    if (stream.eat('"')) break;
                    stream.next();
                }
                return 'string';
            }

            // Registers and Instructions
            // Simple heuristic: 2-4 letter words are likely instructions or registers
            if (stream.match(/^[a-z_][\w\.]*/i)) {
                return 'keyword';
            }

            // Labels
            if (stream.peek() === ':') {
                stream.next();
                return 'labelName';
            }

            stream.next();
            return null;
        },
    };

    public getLanguageParser(): Extension[] {
        return [StreamLanguage.define(this.parser)];
    }

    public getLanguage(): string {
        return 'Assembly';
    }
}
