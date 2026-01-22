---
name: "node-editor"
description: "Provides tools and guidance for creating and managing visual node-based editors. Invoke when user needs to create, configure, or enhance node editors with features like drag-and-drop nodes, connections, and property editing."
---

# Node Editor Skill

This skill helps users create and manage visual node-based editors with the following features:

## Core Features
- Drag-and-drop node creation and positioning
- Connection between nodes with customizable paths
- Node property editing and configuration
- Canvas zooming and panning
- Undo/redo functionality

## Project Structure
```
src/
├── components/
│   ├── Canvas/        # Canvas component for node placement
│   ├── Connection/    # Connection lines between nodes
│   ├── Node/          # Node component with ports
│   ├── Sidebar/       # Sidebar for node library
│   └── Toolbar/       # Toolbar with editor controls
├── store/
│   └── editorStore.ts # Zustand store for editor state
└── types/
    └── index.ts       # Type definitions for editor elements
```

## Usage Examples

### Creating a New Node Editor
1. Set up the basic project structure with React and TypeScript
2. Install dependencies: zustand for state management
3. Create the core components: Canvas, Node, Connection
4. Implement state management with editorStore
5. Add UI components: Sidebar and Toolbar

### Adding New Node Types
1. Define node types in types/index.ts
2. Add node templates to the sidebar
3. Implement node-specific property editors
4. Configure connection rules between node types

### Enhancing Editor Functionality
- Add keyboard shortcuts for common operations
- Implement node grouping and collapsing
- Add zoom-to-fit functionality
- Create export/import functionality for node graphs
- Add undo/redo history management

## Technical Requirements
- React 18+
- TypeScript 5+
- Zustand for state management
- Tailwind CSS for styling
- Vite for development environment

## Best Practices
- Use functional components with React hooks
- Implement proper state management with Zustand
- Optimize canvas rendering for performance
- Use TypeScript interfaces for type safety
- Follow component-based architecture principles