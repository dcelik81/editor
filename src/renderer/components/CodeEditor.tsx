import CodeMirror from '@uiw/react-codemirror';
import { SyntaxStrategy } from '../strategy/syntax-highlighting/SyntaxStrategy';

interface CodeEditorProps {
    value: string;
    onChange: (val: string) => void;
    syntaxStrategy: SyntaxStrategy;
}

export default function CodeEditor({
    value,
    onChange,
    syntaxStrategy,
}: CodeEditorProps) {
    return (
        <CodeMirror
            value={value}
            theme={'none'}
            extensions={syntaxStrategy.getLanguageParser()}
            onChange={(val) => onChange(val)}
        />
    );
}
