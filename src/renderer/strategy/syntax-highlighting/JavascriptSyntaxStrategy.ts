import { Extension } from '@codemirror/state';
import { StreamLanguage, StringStream } from '@codemirror/language';
import { SyntaxStrategy } from './SyntaxStrategy';

export class JavascriptSyntaxStrategy implements SyntaxStrategy {
    parser = {
        token(stream: StringStream) {
            if (stream.eatSpace()) return null;

            // --- 1. Comments (Simplified: only line comments) ---
            if (stream.match('//')) {
                stream.skipToEnd();
                return 'comment';
            }

            // --- 2. Strings (Simplified: only " and ' - ignores escapes and template literals) ---
            // Double-quoted strings
            if (stream.eat('"')) {
                while (!stream.eol() && stream.next() !== '"') {}
                return 'string';
            }
            // Single-quoted strings
            if (stream.eat("'")) {
                while (!stream.eol() && stream.next() !== "'") {}
                return 'string';
            }

            // --- 3. Numbers (Hex, Binary, Decimal) ---
            if (
                stream.match(
                    /^(?:0x[0-9a-fA-F]+|0b[01]+|\d*\.?\d+(?:e[+-]?\d+)?)/i,
                )
            ) {
                return 'number';
            }

            // --- 4. Keywords, Identifiers, and Built-ins ---
            // Match any word-like token
            if (stream.match(/^[a-zA-Z_$][\w$]*/)) {
                const word = stream.current();

                // A. Keywords
                const keywords = [
                    'function',
                    'var',
                    'const',
                    'let',
                    'return',
                    'if',
                    'else',
                    'for',
                    'while',
                    'class',
                    'new',
                    'this',
                    'import',
                    'export',
                    'await',
                    'async',
                ];
                if (keywords.includes(word)) {
                    return 'keyword';
                }

                // B. Atoms (Literals)
                const atoms = ['true', 'false', 'null', 'undefined'];
                if (atoms.includes(word)) {
                    return 'atom';
                }

                // C. Everything else is a variable/identifier
                return 'variable';
            }

            // --- 5. Operators and Punctuation (Single and Multi-char) ---
            // This handles things like ===, +=, ++, {, }, ;, etc.
            if (stream.match(/^(?:[+\-*\/%&|^!~=<>?]{1,3}|[\[\]{}();,.:])/)) {
                // A more specific tokenizer might assign classes like 'operator', 'bracket', 'punctuation'
                return 'operator';
            }

            // --- 6. Fallback ---
            // Consume one character and stop.
            stream.next();
            return null;
        },
    };

    public getLanguageParser(): Extension[] {
        return [StreamLanguage.define(this.parser)];
    }

    public getLanguage(): string {
        return 'Javascript/Typescript';
    }
}
