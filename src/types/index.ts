// 节点类型定义
export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  inputs: NodePort[];
  outputs: NodePort[];
}

// 节点端口类型定义
export interface NodePort {
  id: string;
  name: string;
  type: string;
}

// 连接类型定义
export interface Connection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

// 编辑器状态类型定义
export interface EditorState {
  nodes: Node[];
  connections: Connection[];
  selectedNodeIds: string[];
  canvas: {
    x: number;
    y: number;
    zoom: number;
  };
  isDraggingCanvas: boolean;
  draggedNodeId: string | null;
  connectionStart: {
    nodeId: string;
    portId: string;
    position: { x: number; y: number };
  } | null;
  // 编辑状态管理
  editingNodeId: string | null; // 当前正在编辑的节点ID
  // 框选功能相关
  selectionBox: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null;
  isSelecting: boolean;
}

// 节点模板类型定义
export interface NodeTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  width: number;
  height: number;
  inputs: NodePort[];
  outputs: NodePort[];
}