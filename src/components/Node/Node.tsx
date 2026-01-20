import React, { useRef, useEffect } from 'react';
import { Node as NodeType, NodePort } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import NodeDescriptionEditor from './NodeDescriptionEditor';

interface NodeProps {
  node: NodeType;
}

const Node: React.FC<NodeProps> = ({ node }) => {
  const nodeRef = useRef<SVGGElement>(null);
  const { 
    state, 
    updateNode, 
    setDraggedNodeId, 
    setConnectionStart, 
    selectNode
  } = useEditorStore();
  
  const { canvas, draggedNodeId, selectedNodeIds, connectionStart } = state;
  const isSelected = selectedNodeIds.includes(node.id);
  
  // 计算连接点位置
  const calculatePortPosition = (port: NodePort, isInput: boolean) => {
    const portIndex = isInput 
      ? node.inputs.findIndex(p => p.id === port.id)
      : node.outputs.findIndex(p => p.id === port.id);
    const totalPorts = isInput ? node.inputs.length : node.outputs.length;
    const y = node.y + 30 + (node.height - 40) * (portIndex + 0.5) / totalPorts;
    const x = isInput ? node.x : node.x + node.width;
    return { x, y };
  };
  
  // 鼠标位置和偏移量跟踪
  const mouseOffset = useRef({ x: 0, y: 0 });
  
  // 处理节点拖拽开始
  const handleNodeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
    // 检查是否按住shift键
    const isShiftPressed = e.shiftKey;
    // 选中节点，传递shift状态
    selectNode(node.id, isShiftPressed);
    
    // 计算鼠标相对于画布的坐标（考虑画布平移和缩放）
    const canvasX = (e.clientX - canvas.x) / canvas.zoom;
    const canvasY = (e.clientY - canvas.y) / canvas.zoom;
    
    // 计算鼠标相对于节点左上角的偏移量
    mouseOffset.current = {
      x: canvasX - node.x,
      y: canvasY - node.y
    };
  };
  
  // 处理连接点鼠标按下，开始拖拽
  const handlePortMouseDown = (e: React.MouseEvent, port: NodePort, isInput: boolean) => {
    e.stopPropagation();
    
    // 只允许从输出端口开始拖拽
    if (isInput) return;
    
    // 开始创建连接
    const portPos = calculatePortPosition(port, isInput);
    setConnectionStart({
      nodeId: node.id,
      portId: port.id,
      position: portPos
    });
  };
  
  // 处理连接点鼠标释放，完成连接
  const handlePortMouseUp = (e: React.MouseEvent, port: NodePort, isInput: boolean) => {
    e.stopPropagation();
    
    // 只有在有连接开始时才处理
    if (!connectionStart) return;
    
    // 只允许连接到输入端口
    if (!isInput) return;
    
    // 确保连接是从输出到输入
    const startNode = state.nodes.find(n => n.id === connectionStart.nodeId);
    if (!startNode) {
      setConnectionStart(null);
      return;
    }
    
    // 检查开始端口是否是输出端口
    const startPort = startNode.outputs.find(p => p.id === connectionStart.portId);
    if (!startPort) {
      setConnectionStart(null);
      return;
    }
    
    // 创建新连接
    const { addConnection } = useEditorStore.getState();
    addConnection({
      fromNodeId: connectionStart.nodeId,
      fromPortId: connectionStart.portId,
      toNodeId: node.id,
      toPortId: port.id
    });
    
    // 重置连接开始状态
    setConnectionStart(null);
  };
  
  // 处理连接点鼠标进入
  const handlePortMouseEnter = (_port: NodePort, isInput: boolean) => {
    if (!connectionStart || !isInput) return;
    // 这里可以添加视觉反馈
  };
  
  // 处理连接点鼠标离开
  const handlePortMouseLeave = (_port: NodePort, isInput: boolean) => {
    if (!connectionStart || !isInput) return;
    // 这里可以移除视觉反馈
  };
  
  // 监听全局鼠标事件，处理节点拖拽
  useEffect(() => {
    if (draggedNodeId !== node.id) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // 计算鼠标相对于画布的坐标（考虑画布平移和缩放）
      const canvasX = (e.clientX - canvas.x) / canvas.zoom;
      const canvasY = (e.clientY - canvas.y) / canvas.zoom;
      
      // 使用偏移量计算节点新位置
      const newX = canvasX - mouseOffset.current.x;
      const newY = canvasY - mouseOffset.current.y;
      
      updateNode(node.id, { x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setDraggedNodeId(null);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNodeId, node.id, canvas, updateNode, setDraggedNodeId]);
  
  // 监听全局鼠标事件，处理连接创建过程
  useEffect(() => {
    if (!connectionStart) return;
    
    // 点击空白处取消连接创建
    const handleGlobalMouseDown = (e: MouseEvent) => {
      // 检查点击的是否是画布空白处
      const target = e.target as HTMLElement;
      if (target.tagName === 'svg' || target.tagName === 'rect') {
        const { setConnectionStart } = useEditorStore.getState();
        setConnectionStart(null);
      }
    };
    
    // 监听mousedown而不是click，避免与端口点击事件冲突
    window.addEventListener('mousedown', handleGlobalMouseDown);
    
    return () => {
      window.removeEventListener('mousedown', handleGlobalMouseDown);
    };
  }, [connectionStart]);
  
  return (
    <g 
      ref={nodeRef}
      transform={`translate(${node.x}, ${node.y})`}
      className="select-none"
    >
      {/* 节点主体 */}
      <rect
        x={0}
        y={0}
        width={node.width}
        height={node.height}
        rx={6}
        fill="#ffffff"
        stroke={isSelected ? '#3b82f6' : '#d1d5db'}
        strokeWidth={isSelected ? 4 : 2}
      />
      
      {/* 节点标题栏 */}
      <rect
        x={0}
        y={0}
        width={node.width}
        height={24}
        rx="6 6 0 0"
        fill="#f3f4f6"
        stroke="none"
        className="cursor-move"
        onMouseDown={handleNodeMouseDown}
      />
      
      {/* 节点标题 */}
      <text
        x={node.width / 2}
        y={16}
        textAnchor="middle"
        className="text-xs font-medium cursor-move"
        fill="#374151"
        onMouseDown={handleNodeMouseDown}
      >
        {node.title}
      </text>
      
      {/* 节点描述编辑器 */}
      <NodeDescriptionEditor node={node} />
      
      {/* 输入连接点 */}
      {node.inputs.map((port) => {
        const portPos = calculatePortPosition(port, true);
        return (
          <g key={port.id} className="cursor-pointer">
            <circle
              cx={node.x - node.x}
              cy={portPos.y - node.y}
              r={6}
              fill={connectionStart ? '#3b82f6' : '#9ca3af'}
              stroke={connectionStart ? '#2563eb' : '#6b7280'}
              strokeWidth={1}
              onMouseUp={(e) => handlePortMouseUp(e, port, true)}
              onMouseEnter={() => handlePortMouseEnter(port, true)}
              onMouseLeave={() => handlePortMouseLeave(port, true)}
            />
            <text
              x={node.x - node.x - 10}
              y={portPos.y - node.y + 4}
              textAnchor="end"
              className="text-xs fill-gray-600"
            >
              {port.name}
            </text>
          </g>
        );
      })}
      
      {/* 输出连接点 */}
      {node.outputs.map((port) => {
        const portPos = calculatePortPosition(port, false);
        return (
          <g key={port.id} className="cursor-pointer">
            <circle
              cx={node.width}
              cy={portPos.y - node.y}
              r={6}
              fill="#10b981"
              stroke="#059669"
              strokeWidth={1}
              onMouseDown={(e) => handlePortMouseDown(e, port, false)}
              onMouseEnter={() => handlePortMouseEnter(port, false)}
              onMouseLeave={() => handlePortMouseLeave(port, false)}
            />
            <text
              x={node.width + 10}
              y={portPos.y - node.y + 4}
              textAnchor="start"
              className="text-xs fill-gray-600"
            >
              {port.name}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default Node;