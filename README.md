# Plugin-Based Text Editor

A modern, extensible desktop text editor built with Electron, React, and TypeScript. This application demonstrates the implementation of key software design patterns to create a maintainable and scalable architecture.

- [Doğukan Çelik - 20200808071](https://github.com/dcelik81)
- [Hüseyin Mert Afşarlı - 20210808031](https://github.com/HuseyinMertAfsarli)
- [Serhat Buğra Tana - 20220808001](https://github.com/SerhatTana)

## Features

-   **File Management**: Browse your file system, open files, and save changes seamlessly.
-   **Code Editing**: robust code editor component powered by CodeMirror.
-   **Syntax Highlighting**: Automatic syntax highlighting detection for:
    -   JavaScript / TypeScript
    -   Java
    -   Assembly (.asm, .s)
    -   Plain Text
-   **Notification System**: Real-time feedback for user actions (file saved, errors, etc.).
-   **Clean UI**: A focused, dark-themed interface for coding.

## Technologies

-   **Electron**: For cross-platform desktop application development.
-   **React**: For building the user interface.
-   **TypeScript**: For type-safe code.
-   **Sass**: For styling.
-   **Webpack**: For bundling the application.
-   **CodeMirror**: For the underlying editor engine.

## Architecture & Design Patterns

The project follows a modular architecture utilizing several GoF (Gang of Four) design patterns to separate concerns and improve code readability.

### 1. Command Pattern
Used to encapsulate file operations as objects. This allows for cleaner execution and potential future features like undo/redo.
-   **Location**: `src/renderer/command/`
-   **Implementation**: `SaveFileCommand`, `CreateFileCommand`, `CreateDirectoryCommand` implement the `Command` interface and are executed via a `CommandInvoker`.

### 2. Strategy Pattern
Used to handle syntax highlighting logic dynamically based on the file type.
-   **Location**: `src/renderer/strategy/`
-   **Implementation**: The `SyntaxFactory` determines which strategy (`JavascriptSyntaxStrategy`, `JavaSyntaxStrategy`, etc.) to apply when a file is opened.

### 3. Observer Pattern
Used for the application-wide notification system.
-   **Location**: `src/renderer/observer/`
-   **Implementation**: `NotificationCenter` acts as the subject. Components like `NotificationPanel` observe changes and update the UI when new notifications are pushed.

## Getting Started

### Prerequisites

-   Node.js (>= 14.x)
-   npm (>= 7.x)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/dcelik81/editor.git
    cd editor
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the application in development mode:

```bash
npm start
```

## Project Structure

```
src/
├── main/                 # Electron Main Process code
│   ├── Application.ts    # App lifecycle management
│   ├── IpcService.ts     # IPC handlers (File system access)
│   └── ...
├── renderer/             # React Renderer Process code
│   ├── components/       # UI Components (Editor, Explorer, etc.)
│   ├── command/          # Command Pattern implementation
│   ├── strategy/         # Strategy Pattern implementation
│   ├── observer/         # Observer Pattern implementation
│   ├── App.tsx           # Main React component
│   └── ...
└── ...
```

