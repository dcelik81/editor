import React, { Component } from 'react';

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
            // Sort directories first
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
        // simplistic parent resolution
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
                    <button onClick={this.handleOpenFolder}>Open Folder</button>
                    {currentPath && (
                        <button
                            onClick={this.handleGoUp}
                            style={{ marginTop: '5px' }}
                        >
                            ⬆ Up
                        </button>
                    )}
                    <div className="current-path" title={currentPath}>
                        {currentPath
                            ? currentPath.split(/[/\\]/).pop()
                            : 'No Folder'}
                    </div>
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
