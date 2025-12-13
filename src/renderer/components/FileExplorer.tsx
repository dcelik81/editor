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
    isModalOpen: boolean;
    modalType: 'file' | 'dir' | null;
    modalInputValue: string;
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
            isModalOpen: false,
            modalType: null,
            modalInputValue: '',
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

    openCreationModal = (type: 'file' | 'dir') => {
        const { currentPath } = this.state;
        if (!currentPath) return;

        this.setState({
            isModalOpen: true,
            modalType: type,
            modalInputValue: '',
        });
    };

    closeModal = () => {
        this.setState({
            isModalOpen: false,
            modalType: null,
            modalInputValue: '',
        });
    };

    handleConfirmCreation = async () => {
        const { currentPath, modalType, modalInputValue } = this.state;

        if (!modalInputValue.trim()) {
            alert('Lütfen bir isim girin.');
            return;
        }

        const separator = navigator.platform.includes('Win') ? '\\' : '/';
        const targetPath = `${currentPath}${separator}${modalInputValue}`;

        if (modalType === 'file') {
            const cmd = new CreateFileCommand(targetPath);
            await invoker.executeCommand(cmd);
            this.props.onSelectFile(targetPath);
        } else {
            const cmd = new CreateDirectoryCommand(targetPath);
            await invoker.executeCommand(cmd);
        }

        this.loadFiles(currentPath);
        this.closeModal();
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
        const separator = currentPath.includes('/') ? '/' : '\\';
        const lastIndex = currentPath.lastIndexOf(separator);
        if (lastIndex > 0) {
            const parent = currentPath.substring(0, lastIndex);
            this.setState({ currentPath: parent });
            this.loadFiles(parent);
        }
    };

    render() {
        const { currentPath, files, isModalOpen, modalType, modalInputValue } =
            this.state;

        return (
            <div className="file-explorer" style={{ position: 'relative' }}>
                {/* --- BURASI YENİ: Giriş Penceresi (Modal) --- */}
                {isModalOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)', // Arka planı karart
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000, // En üstte görünsün
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#21252b',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #181a1f',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                width: '250px',
                                textAlign: 'center',
                            }}
                        >
                            <h3
                                style={{
                                    margin: '0 0 15px 0',
                                    color: 'white',
                                    fontSize: '14px',
                                }}
                            >
                                {modalType === 'file'
                                    ? 'Yeni Dosya Oluştur'
                                    : 'Yeni Klasör Oluştur'}
                            </h3>

                            <input
                                type="text"
                                autoFocus
                                placeholder="İsim giriniz..."
                                value={modalInputValue}
                                onChange={(e) =>
                                    this.setState({
                                        modalInputValue: e.target.value,
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                        this.handleConfirmCreation();
                                    if (e.key === 'Escape') this.closeModal();
                                }}
                                style={{
                                    width: '90%',
                                    padding: '8px',
                                    marginBottom: '15px',
                                    backgroundColor: '#282c34',
                                    border: '1px solid #181a1f',
                                    color: 'white',
                                    borderRadius: '4px',
                                }}
                            />

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <button
                                    onClick={this.closeModal}
                                    style={{
                                        backgroundColor: '#e06c75',
                                        border: 'none',
                                        padding: '6px 12px',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={this.handleConfirmCreation}
                                    style={{
                                        backgroundColor: '#98c379',
                                        border: 'none',
                                        padding: '6px 12px',
                                        color: '#282c34',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Oluştur
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="explorer-header">
                    <button
                        onClick={this.handleOpenFolder}
                        style={{ marginBottom: '5px', width: '100%' }}
                    >
                        Open Folder
                    </button>

                    {currentPath && (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '5px',
                                    marginBottom: '5px',
                                }}
                            >
                                <button
                                    onClick={() =>
                                        this.openCreationModal('file')
                                    }
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#61afef',
                                        color: '#282c34',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    + File
                                </button>
                                <button
                                    onClick={() =>
                                        this.openCreationModal('dir')
                                    }
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#c678dd',
                                        color: '#282c34',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    + Directory
                                </button>
                            </div>
                            <button
                                onClick={this.handleGoUp}
                                style={{ width: '100%' }}
                            >
                                ⬆ Up
                            </button>
                            <div
                                className="current-path"
                                title={currentPath}
                                style={{ marginTop: '5px' }}
                            >
                                {currentPath.split(/[/\\]/).pop()}
                            </div>
                        </>
                    )}

                    {!currentPath && (
                        <div className="current-path">No Folder Selected</div>
                    )}
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
