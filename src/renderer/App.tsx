import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import NotificationPanel from './components/NotificationPanel';
import { notificationCenter } from './observer/NotificationCenter';

import { SyntaxFactory } from './strategy/syntax-highlighting/SyntaxFactory';

import { SaveFileCommand } from './command/SaveFileCommand';
import { CommandInvoker } from './command/CommandInvoker';

const commandInvoker = new CommandInvoker();

function EditorLayout() {
    const [currentFile, setCurrentFile] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isDirty, setIsDirty] = useState(false);

    const strategy = useMemo(() => {
        return SyntaxFactory.createSyntaxStrategy(currentFile);
    }, [currentFile]);

    const handleSelectFile = async (path: string) => {
        if (isDirty) {
            if (!window.confirm('Kaydedilmemiş değişiklikler var. Devam edilsin mi?')) {
                return;
            }
        }
        try {
            const text = await window.electron.files.readFile(path);
            setCurrentFile(path);
            setContent(text);
            setIsDirty(false);
            
            // Observer Pattern: Trigger notification
            notificationCenter.push(`Opened file: ${path.split('\\').pop()}`, 'info');
        } catch (err) {
            console.error(err);
            notificationCenter.push(`Failed to open file: ${path}`, 'error');
        }
    };

    const handleContentChange = (val: string) => {
        setContent(val);
        setIsDirty(true);
    };

    // --- COMMAND FONKSİYONLARI ---
    const handleSave = async () => {
        if (currentFile) {
            try {
                const saveCmd = new SaveFileCommand(currentFile, content);
                await commandInvoker.executeCommand(saveCmd);
                setIsDirty(false);
                
                // Observer Pattern: Trigger notification on success
                notificationCenter.push('File saved successfully!', 'success');
            } catch (err) {
                console.error(err);
                // Observer Pattern: Trigger notification on failure
                notificationCenter.push('Failed to save file.', 'error');
            }
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
            {/* GLOBAL OBSERVER COMPONENT: Notification Panel */}
            <NotificationPanel />
            
            <FileExplorer onSelectFile={handleSelectFile} />
            <div className="editor-container">
                {currentFile ? (
                    <>
                        <div className="editor-header">
                            <span>
                                {currentFile} {isDirty ? '●' : ''}
                            </span>
                            {/* Sadece Save Butonu Burada Kaldı */}
                            <button className="save-btn" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                        <CodeEditor
                            value={content}
                            onChange={handleContentChange}
                            syntaxStrategy={strategy}
                        />
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5c6370' }}>
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
