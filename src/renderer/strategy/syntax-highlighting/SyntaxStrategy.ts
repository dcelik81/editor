import { StringStream } from '@codemirror/language';
import { Extension } from '@codemirror/state';

export interface SyntaxStrategy {
    parser: {
        token(stream: StringStream): string | null;
    };
    getLanguageParser(): Extension[];
    getLanguage(): string;
}
