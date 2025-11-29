import React, { useState } from 'react';

interface FileNode {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface FileExplorerProps {
  onSelectFile: (path: string) => void;
}

export default function FileExplorer({ onSelectFile }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileNode[]>([]);

  const handleOpenFolder = async () => {
    const path = await window.electron.files.selectDirectory();
    if (path) {
      setCurrentPath(path);
      loadFiles(path);
    }
  };

  const loadFiles = async (path: string) => {
    try {
      const result = await window.electron.files.readDir(path);
      // Sort directories first
      const sorted = result.sort((a: FileNode, b: FileNode) => {
        if (a.isDirectory === b.isDirectory) {
          return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
      });
      setFiles(sorted);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNodeClick = (file: FileNode) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
      loadFiles(file.path);
    } else {
      onSelectFile(file.path);
    }
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    // simplistic parent resolution
    const separator = currentPath.includes('/') ? '/' : '\\';
    const lastIndex = currentPath.lastIndexOf(separator);
    if (lastIndex > 0) {
      const parent = currentPath.substring(0, lastIndex);
      setCurrentPath(parent);
      loadFiles(parent);
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <button onClick={handleOpenFolder}>Open Folder</button>
        {currentPath && <button onClick={handleGoUp} style={{marginTop: '5px'}}>⬆ Up</button>}
        <div className="current-path" title={currentPath}>
          {currentPath ? currentPath.split(/[/\\]/).pop() : 'No Folder'}
        </div>
      </div>
      <div className="file-list">
        {files.map((file) => (
          <div
            key={file.path}
            className={`file-item ${file.isDirectory ? 'directory' : 'file'}`}
            onClick={() => handleNodeClick(file)}
          >
            <span className="icon">{file.isDirectory ? '📁' : '📄'}</span>
            <span className="name">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

