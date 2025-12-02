import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';

function EditorLayout() {
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [isDirty, setIsDirty] = useState(false);

    const handleSelectFile = async (path: string) => {
        if (isDirty) {
            if (!window.confirm('You have unsaved changes. Discard them?')) {
                return;
            }
        }
        try {
            const text = await window.electron.files.readFile(path);
            setCurrentFile(path);
            setContent(text);
            setIsDirty(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleContentChange = (val: string) => {
        setContent(val);
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (currentFile) {
            const success = await window.electron.files.saveFile(
                currentFile,
                content,
            );
            if (success) setIsDirty(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentFile, content]);

    return (
        <div className="app-container">
            <FileExplorer onSelectFile={handleSelectFile} />
            <div className="editor-container">
                {currentFile ? (
                    <>
                        <div className="editor-header">
                            <span>
                                {currentFile} {isDirty ? '●' : ''}
                            </span>
                            <button className="save-btn" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                        <CodeEditor
                            value={content}
                            onChange={handleContentChange}
                        />
                    </>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#5c6370',
                        }}
                    >
                        Select a file to edit
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<EditorLayout />} />
            </Routes>
        </Router>
    );
}
