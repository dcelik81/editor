import { Extension } from '@codemirror/state';
import { SyntaxStrategy } from './SyntaxStrategy';
import { StreamLanguage, StringStream } from '@codemirror/language';

export class JavaSyntaxStrategy implements SyntaxStrategy {
    parser = {
        token(stream: StringStream) {
            if (stream.eatSpace()) return null;

            // --- 1. Comments (Simplified: only line comments, ignores /** */ Javadoc) ---
            if (stream.match('//')) {
                stream.skipToEnd();
                return 'comment';
            }

            // --- 2. Strings (Simplified: only double quotes, ignores escapes and multi-line strings) ---
            if (stream.eat('"')) {
                while (!stream.eol() && stream.next() !== '"') {}
                return 'string';
            }

            // --- 3. Characters (Single quotes) ---
            if (stream.eat("'")) {
                // Usually consumes an optional escape character and then the character and the closing quote
                stream.next();
                if (stream.peek() === '\\') stream.next(); // simple escape
                stream.next(); // the closing '
                return 'string-2'; // CodeMirror often uses 'string-2' for char literals
            }

            // --- 4. Numbers (Decimal, Hex, Octal, Floats) ---
            if (
                stream.match(
                    /^(?:0x[0-9a-fA-F]+|0[0-7]+|\d*\.?\d+(?:e[+-]?\d+)?)[lLfF]?/i,
                )
            ) {
                // The [lLfF]? handles optional suffixes for long, float, and double
                return 'number';
            }

            // --- 5. Keywords, Identifiers, and Built-ins ---
            // Match any word-like token
            if (stream.match(/^[a-zA-Z_$][\w$]*/)) {
                const word = stream.current();

                // A. Keywords
                const keywords = [
                    'public',
                    'protected',
                    'private',
                    'class',
                    'interface',
                    'abstract',
                    'final',
                    'static',
                    'void',
                    'new',
                    'return',
                    'if',
                    'else',
                    'for',
                    'while',
                    'do',
                    'try',
                    'catch',
                    'finally',
                    'throw',
                    'throws',
                    'package',
                    'import',
                    'instanceof',
                    'super',
                    'this',
                    'enum',
                    'record',
                ];
                if (keywords.includes(word)) {
                    return 'keyword';
                }

                // B. Primitive Types
                const primitiveTypes = [
                    'int',
                    'long',
                    'short',
                    'byte',
                    'float',
                    'double',
                    'boolean',
                    'char',
                ];
                if (primitiveTypes.includes(word)) {
                    return 'typeName'; // CodeMirror class for data types
                }

                // C. Atoms (Literals)
                const atoms = ['true', 'false', 'null'];
                if (atoms.includes(word)) {
                    return 'atom';
                }

                // D. Everything else is a variable, class name, or method name
                return 'variable';
            }

            // --- 6. Operators and Punctuation (Single and Multi-char) ---
            // This handles things like ==, ++, {, }, ;, etc.
            if (stream.match(/^(?:[+\-*\/%&|^!~=<>?]{1,3}|[\[\]{}();,.:@])/)) {
                return 'operator';
            }

            // --- 7. Fallback ---
            stream.next();
            return null;
        },
    };

    public getLanguageParser(): Extension[] {
        return [StreamLanguage.define(this.parser)];
    }

    public getLanguage(): string {
        return 'Java';
    }
}
