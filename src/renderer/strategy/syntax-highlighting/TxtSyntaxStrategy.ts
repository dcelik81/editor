import { Extension } from '@codemirror/state';
import { StreamLanguage, StringStream } from '@codemirror/language';
import { SyntaxStrategy } from './SyntaxStrategy';

export class TxtSyntaxStrategy implements SyntaxStrategy {
    parser = {
        token(stream: StringStream) {
            if (stream.eatSpace()) return null;

            stream.next();
            return null;
        },
    };

    public getLanguageParser(): Extension[] {
        return [StreamLanguage.define(this.parser)];
    }

    public getLanguage(): string {
        return 'Txt';
    }
}
