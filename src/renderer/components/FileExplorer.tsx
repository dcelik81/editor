import React, { Component } from 'react';
// Command Pattern Importları
import { CreateFileCommand } from '../command/CreateFileCommand';
import { CreateDirectoryCommand } from '../command/CreateDirectoryCommand';
import { CommandInvoker } from '../command/CommandInvoker';

// Invoker'ı oluşturuyoruz
const invoker = new CommandInvoker();

interface FileNode {
    name: string;
    isDirectory: boolean;
    path: string;
}

interface FileExplorerProps {
    onSelectFile: (path: string) => void;
}

interface FileExplorerState {
    currentPath: string;
    files: FileNode[];
}

export default class FileExplorer extends Component<
    FileExplorerProps,
    FileExplorerState
> {
    constructor(props: FileExplorerProps) {
        super(props);
        this.state = {
            currentPath: '',
            files: [],
        };
    }

    handleOpenFolder = async () => {
        const path = await window.electron.files.selectDirectory();
        if (path) {
            this.setState({ currentPath: path });
            this.loadFiles(path);
        }
    };

    loadFiles = async (path: string) => {
        try {
            const result = await window.electron.files.readDir(path);
            const sorted = result.sort((a: FileNode, b: FileNode) => {
                if (a.isDirectory === b.isDirectory) {
                    return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
            });
            this.setState({ files: sorted });
        } catch (error) {
            console.error(error);
        }
    };

    // --- YENİ EKLENEN FONKSİYONLAR ---

    handleCreateFile = async () => {
        const { currentPath } = this.state;
        if (!currentPath) return;

        const fileName = window.prompt("Dosya adı (örn: yeni.js):");
        if (!fileName) return;

        // İşletim sistemine göre ayraç (\ veya /)
        const separator = navigator.platform.includes('Win') ? '\\' : '/';
        const targetPath = `${currentPath}${separator}${fileName}`;

        // Komutu çalıştır
        const cmd = new CreateFileCommand(targetPath);
        await invoker.executeCommand(cmd);

        // Listeyi yenile ve dosyayı aç
        this.loadFiles(currentPath);
        this.props.onSelectFile(targetPath);
    };

    handleCreateDir = async () => {
        const { currentPath } = this.state;
        if (!currentPath) return;

        const dirName = window.prompt("Klasör adı:");
        if (!dirName) return;

        const separator = navigator.platform.includes('Win') ? '\\' : '/';
        const targetPath = `${currentPath}${separator}${dirName}`;

        // Komutu çalıştır
        const cmd = new CreateDirectoryCommand(targetPath);
        await invoker.executeCommand(cmd);

        // Listeyi yenile
        this.loadFiles(currentPath);
    };
    // --------------------------------

    handleNodeClick = (file: FileNode) => {
        if (file.isDirectory) {
            this.setState({ currentPath: file.path });
            this.loadFiles(file.path);
        } else {
            this.props.onSelectFile(file.path);
        }
    };

    handleGoUp = () => {
        const { currentPath } = this.state;
        if (!currentPath) return;
        const separator = currentPath.includes('/') ? '/' : '\\';
        const lastIndex = currentPath.lastIndexOf(separator);
        if (lastIndex > 0) {
            const parent = currentPath.substring(0, lastIndex);
            this.setState({ currentPath: parent });
            this.loadFiles(parent);
        }
    };

    render() {
        const { currentPath, files } = this.state;

        return (
            <div className="file-explorer">
                <div className="explorer-header">
                    <button onClick={this.handleOpenFolder} style={{marginBottom: '5px', width: '100%'}}>
                        Open Folder
                    </button>

                    {/* BUTONLAR SADECE KLASÖR AÇIKSA GÖRÜNÜR */}
                    {currentPath && (
                        <>
                            <div style={{display: 'flex', gap: '5px', marginBottom: '5px'}}>
                                <button
                                    onClick={this.handleCreateFile}
                                    style={{flex: 1, backgroundColor: '#61afef', color: '#282c34', border: 'none'}}
                                >
                                    + File
                                </button>
                                <button
                                    onClick={this.handleCreateDir}
                                    style={{flex: 1, backgroundColor: '#c678dd', color: '#282c34', border: 'none'}}
                                >
                                    + Dir
                                </button>
                            </div>
                            <button onClick={this.handleGoUp} style={{width: '100%'}}>
                                ⬆ Up
                            </button>
                            <div className="current-path" title={currentPath} style={{marginTop: '5px'}}>
                                {currentPath.split(/[/\\]/).pop()}
                            </div>
                        </>
                    )}

                    {!currentPath && <div className="current-path">No Folder Selected</div>}
                </div>

                <div className="file-list">
                    {files.map((file) => (
                        <div
                            key={file.path}
                            className={`file-item ${file.isDirectory ? 'directory' : 'file'}`}
                            onClick={() => this.handleNodeClick(file)}
                        >
                            <span className="icon">
                                {file.isDirectory ? '📁' : '📄'}
                            </span>
                            <span className="name">{file.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
