import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={[javascript({ jsx: true })]}
        onChange={(val) => onChange(val)}
      />
    </div>
  );
}

