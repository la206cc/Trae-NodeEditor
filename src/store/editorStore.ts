import { create } from 'zustand';
import { EditorState, Node, Connection, NodeTemplate } from '../types';

// 初始节点模板
export const nodeTemplates: NodeTemplate[] = [
  {
    id: 'template-1',
    type: 'input',
    title: '输入节点',
    description: '提供输入数据',
    width: 180,
    height: 80,
    inputs: [],
    outputs: [
      { id: 'out-1', name: '输出', type: 'default' }
    ]
  },
  {
    id: 'template-2',
    type: 'process',
    title: '处理节点',
    description: '处理输入数据',
    width: 200,
    height: 100,
    inputs: [
      { id: 'in-1', name: '输入', type: 'default' }
    ],
    outputs: [
      { id: 'out-1', name: '输出', type: 'default' }
    ]
  },
  {
    id: 'template-3',
    type: 'output',
    title: '输出节点',
    description: '显示输出结果',
    width: 180,
    height: 80,
    inputs: [
      { id: 'in-1', name: '输入', type: 'default' }
    ],
    outputs: []
  }
];

// 初始状态
const initialState: EditorState = {
  nodes: [],
  connections: [],
  selectedNodeIds: [],
  canvas: {
    x: 0,
    y: 0,
    zoom: 1
  },
  isDraggingCanvas: false,
  draggedNodeId: null,
  connectionStart: null,
  editingNodeId: null, // 初始时没有节点处于编辑状态
  selectionBox: null,
  isSelecting: false
};

// 创建store
export const useEditorStore = create<{
  state: EditorState;
  // 节点操作
  addNode: (node: Omit<Node, 'id'>) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  // 连接操作
  addConnection: (connection: Omit<Connection, 'id'>) => void;
  deleteConnection: (id: string) => void;
  // 画布操作
  setCanvasPosition: (x: number, y: number) => void;
  setCanvasZoom: (zoom: number) => void;
  setIsDraggingCanvas: (isDragging: boolean) => void;
  // 节点拖拽
  setDraggedNodeId: (nodeId: string | null) => void;
  // 连接创建
  setConnectionStart: (start: EditorState['connectionStart']) => void;
  // 选择操作
  selectNode: (nodeId: string, isShiftPressed?: boolean) => void;
  deselectNode: (nodeId: string) => void;
  clearSelection: () => void;
  // 框选操作
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  // 编辑状态操作
  setEditingNodeId: (nodeId: string | null) => void;
}>((set) => ({
  state: initialState,
  
  // 节点操作
  addNode: (node) => {
    const newNode: Node = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    set((state) => ({
      state: {
        ...state.state,
        nodes: [...state.state.nodes, newNode]
      }
    }));
  },
  
  updateNode: (id, updates) => {
    set((state) => ({
      state: {
        ...state.state,
        nodes: state.state.nodes.map(node => 
          node.id === id ? { ...node, ...updates } : node
        )
      }
    }));
  },
  
  deleteNode: (id) => {
    set((state) => ({
      state: {
        ...state.state,
        nodes: state.state.nodes.filter(node => node.id !== id),
        connections: state.state.connections.filter(
          conn => conn.fromNodeId !== id && conn.toNodeId !== id
        ),
        selectedNodeIds: state.state.selectedNodeIds.filter(nodeId => nodeId !== id)
      }
    }));
  },
  
  // 连接操作
  addConnection: (connection) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    set((state) => ({
      state: {
        ...state.state,
        connections: [...state.state.connections, newConnection]
      }
    }));
  },
  
  deleteConnection: (id) => {
    set((state) => ({
      state: {
        ...state.state,
        connections: state.state.connections.filter(conn => conn.id !== id)
      }
    }));
  },
  
  // 画布操作
  setCanvasPosition: (x, y) => {
    set((state) => ({
      state: {
        ...state.state,
        canvas: {
          ...state.state.canvas,
          x,
          y
        }
      }
    }));
  },
  
  setCanvasZoom: (zoom) => {
    set((state) => ({
      state: {
        ...state.state,
        canvas: {
          ...state.state.canvas,
          zoom: Math.max(0.1, Math.min(2, zoom)) // 限制缩放范围
        }
      }
    }));
  },
  
  setIsDraggingCanvas: (isDragging) => {
    set((state) => ({
      state: {
        ...state.state,
        isDraggingCanvas: isDragging
      }
    }));
  },
  
  // 节点拖拽
  setDraggedNodeId: (nodeId) => {
    set((state) => ({
      state: {
        ...state.state,
        draggedNodeId: nodeId
      }
    }));
  },
  
  // 连接创建
  setConnectionStart: (start) => {
    set((state) => ({
      state: {
        ...state.state,
        connectionStart: start
      }
    }));
  },
  
  // 选择操作
  selectNode: (nodeId, isShiftPressed = false) => {
    set((state) => {
      const { selectedNodeIds } = state.state;
      
      if (isShiftPressed) {
        // 如果按住shift键，切换节点选择状态
        if (selectedNodeIds.includes(nodeId)) {
          // 如果已经选中，取消选择
          return {
            state: {
              ...state.state,
              selectedNodeIds: selectedNodeIds.filter(id => id !== nodeId)
            }
          };
        } else {
          // 如果未选中，添加到选择列表
          return {
            state: {
              ...state.state,
              selectedNodeIds: [...selectedNodeIds, nodeId]
            }
          };
        }
      } else {
        // 如果没有按住shift键，只选中当前节点
        return {
          state: {
            ...state.state,
            selectedNodeIds: [nodeId]
          }
        };
      }
    });
  },
  
  deselectNode: (nodeId) => {
    set((state) => ({
      state: {
        ...state.state,
        selectedNodeIds: state.state.selectedNodeIds.filter(id => id !== nodeId)
      }
    }));
  },
  
  clearSelection: () => {
    set((state) => ({
      state: {
        ...state.state,
        selectedNodeIds: []
      }
    }));
  },
  
  // 编辑状态操作
  setEditingNodeId: (nodeId) => {
    set((state) => ({
      state: {
        ...state.state,
        editingNodeId: nodeId
      }
    }));
  },
  
  // 框选操作
  startSelection: (x, y) => {
    set((state) => ({
      state: {
        ...state.state,
        isSelecting: true,
        selectionBox: {
          start: { x, y },
          end: { x, y }
        }
      }
    }));
  },
  
  updateSelection: (x, y) => {
    set((state) => {
      if (!state.state.selectionBox) return state;
      
      return {
        state: {
          ...state.state,
          selectionBox: {
            ...state.state.selectionBox,
            end: { x, y }
          }
        }
      };
    });
  },
  
  endSelection: () => {
    set((state) => {
      const { selectionBox, nodes } = state.state;
      
      if (!selectionBox) {
        return {
          state: {
            ...state.state,
            isSelecting: false,
            selectionBox: null
          }
        };
      }
      
      // 计算选择框的边界
      const left = Math.min(selectionBox.start.x, selectionBox.end.x);
      const right = Math.max(selectionBox.start.x, selectionBox.end.x);
      const top = Math.min(selectionBox.start.y, selectionBox.end.y);
      const bottom = Math.max(selectionBox.start.y, selectionBox.end.y);
      
      // 找出所有在选择框内的节点
      const selectedNodeIds = nodes.filter(node => {
        return (
          node.x >= left &&
          node.x + node.width <= right &&
          node.y >= top &&
          node.y + node.height <= bottom
        );
      }).map(node => node.id);
      
      return {
        state: {
          ...state.state,
          isSelecting: false,
          selectionBox: null,
          selectedNodeIds
        }
      };
    });
  }
}));