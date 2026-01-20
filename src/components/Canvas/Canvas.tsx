import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import Node from '../Node/Node';
import Connection from '../Connection/Connection';
import { Connection as ConnectionType, Node as NodeType, NodeTemplate } from '../../types';

const Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { state, setCanvasPosition, setCanvasZoom, setIsDraggingCanvas, clearSelection, setConnectionStart, addNode, setEditingNodeId, startSelection, updateSelection, endSelection } = useEditorStore();
  const { canvas, isDraggingCanvas, nodes, connections, connectionStart, selectionBox, isSelecting } = state;
  
  // 鼠标位置跟踪
  const mousePos = useRef({ x: 0, y: 0 });
  const currentMousePos = useRef({ x: 0, y: 0 });
  
  // 处理拖拽放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const data = e.dataTransfer.getData('application/reactflow');
    if (!data) return;
    
    const template: NodeTemplate = JSON.parse(data);
    
    // 获取画布容器的位置
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // 计算鼠标在画布容器内的相对位置
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // 计算画布中的绝对位置（考虑画布平移和缩放）
    const canvasX = (mouseX - canvas.x) / canvas.zoom;
    const canvasY = (mouseY - canvas.y) / canvas.zoom;
    
    // 创建新节点，使用精确的鼠标位置
    addNode({
      type: template.type,
      x: Math.round(canvasX - template.width / 2), // 居中放置
      y: Math.round(canvasY - template.height / 2),
      width: template.width,
      height: template.height,
      title: template.title,
      description: template.description,
      inputs: [...template.inputs],
      outputs: [...template.outputs]
    });
  };
  
  // 允许放置
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    // 无论点击哪里，都退出文字编辑状态
    setEditingNodeId(null);
    
    const target = e.target as HTMLElement;
    
    if (e.button === 1) {
      // 中键拖拽画布
      if (target.tagName === 'rect' || target.tagName === 'svg') {
        e.preventDefault();
        setIsDraggingCanvas(true);
        mousePos.current = { x: e.clientX, y: e.clientY };
      }
    } else if (e.button === 0) {
      // 左键点击
      if (target.tagName === 'rect' || target.tagName === 'svg') {
        // 点击空白处，开始框选
        e.preventDefault();
        // 直接使用屏幕坐标，避免转换误差
        startSelection(e.clientX, e.clientY);
      } else {
        // 点击其他元素（如节点），清除选择
        clearSelection();
      }
    }
  };
  
  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent) => {
    // 计算鼠标在画布中的绝对位置（考虑画布平移和缩放）
    const canvasX = (e.clientX - canvas.x) / canvas.zoom;
    const canvasY = (e.clientY - canvas.y) / canvas.zoom;
    
    // 总是更新当前鼠标位置，用于绘制临时连线
    currentMousePos.current = { x: canvasX, y: canvasY };
    
    if (isDraggingCanvas) {
      e.preventDefault();
      const deltaX = e.clientX - mousePos.current.x;
      const deltaY = e.clientY - mousePos.current.y;
      setCanvasPosition(canvas.x + deltaX, canvas.y + deltaY);
      mousePos.current = { x: e.clientX, y: e.clientY };
    } else if (isSelecting) {
      // 更新框选区域，使用屏幕坐标
      e.preventDefault();
      updateSelection(e.clientX, e.clientY);
    } else if (connectionStart) {
      // 连接创建过程中，显示拖拽光标
      (e.currentTarget as HTMLElement).style.cursor = 'crosshair';
    } else {
      // 恢复默认光标
      (e.currentTarget as HTMLElement).style.cursor = 'grab';
    }
  };
  
  // 处理鼠标释放事件
  const handleMouseUp = () => {
    if (connectionStart) {
      // 如果在画布空白处松开鼠标，取消连接创建
      setConnectionStart(null);
      return;
    }
    
    if (isSelecting) {
      // 结束框选
      endSelection();
      return;
    }
    
    setIsDraggingCanvas(false);
  };
  
  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    if (connectionStart) {
      setConnectionStart(null);
    }
    
    if (isSelecting) {
      endSelection();
    }
    
    setIsDraggingCanvas(false);
  };
  
  // 处理滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = canvas.zoom * zoomFactor;
    setCanvasZoom(newZoom);
  };
  
  // 阻止右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  
  // 监听全局鼠标事件，处理画布拖拽和连接创建
  useEffect(() => {
    if (isDraggingCanvas) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - mousePos.current.x;
        const deltaY = e.clientY - mousePos.current.y;
        setCanvasPosition(canvas.x + deltaX, canvas.y + deltaY);
        mousePos.current = { x: e.clientX, y: e.clientY };
      };
      
      const handleGlobalMouseUp = () => {
        setIsDraggingCanvas(false);
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDraggingCanvas, canvas.x, canvas.y, setCanvasPosition, setIsDraggingCanvas]);
  
  // 使用React状态来管理临时连线终点，确保重渲染
  const [tempConnectionEnd, setTempConnectionEnd] = React.useState({ x: 0, y: 0 });
  
  // 监听全局鼠标事件，处理连接创建过程
  useEffect(() => {
    if (!connectionStart) return;
    
    // 更新临时连线位置
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 获取画布容器的位置和尺寸
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // 计算鼠标在画布容器内的相对位置
      const mouseXInCanvas = e.clientX - canvasRect.left;
      const mouseYInCanvas = e.clientY - canvasRect.top;
      
      // 计算鼠标在画布中的绝对位置（考虑画布平移和缩放）
      // 公式：画布坐标 = (容器内坐标 - 画布平移) / 画布缩放
      const canvasX = (mouseXInCanvas - canvas.x) / canvas.zoom;
      const canvasY = (mouseYInCanvas - canvas.y) / canvas.zoom;
      
      // 使用setState更新位置，确保触发重渲染
      setTempConnectionEnd({ x: canvasX, y: canvasY });
      // 同时更新ref，用于其他计算
      currentMousePos.current = { x: canvasX, y: canvasY };
    };
    
    // 处理全局鼠标释放，取消连接创建
    const handleGlobalMouseUp = () => {
      setConnectionStart(null);
    };
    
    // 初始化临时连线终点为当前鼠标位置
    // 使用document.getBoundingClientRect()获取当前鼠标位置
    const mouseEvent = new MouseEvent('mousemove');
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      // 使用当前鼠标位置作为初始位置
      const mouseXInCanvas = mouseEvent.clientX - canvasRect.left;
      const mouseYInCanvas = mouseEvent.clientY - canvasRect.top;
      const canvasX = (mouseXInCanvas - canvas.x) / canvas.zoom;
      const canvasY = (mouseYInCanvas - canvas.y) / canvas.zoom;
      setTempConnectionEnd({ x: canvasX, y: canvasY });
      currentMousePos.current = { x: canvasX, y: canvasY };
    }
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [connectionStart, canvas.x, canvas.y, setConnectionStart]);
  
  // 渲染临时连线
  const renderTempConnection = () => {
    if (!connectionStart) return null;
    
    // 使用React状态作为临时连线终点，确保实时更新
    const endPos = tempConnectionEnd;
    const controlPointOffset = 50;
    const controlPoint1 = { x: connectionStart.position.x + controlPointOffset, y: connectionStart.position.y };
    const controlPoint2 = { x: endPos.x - controlPointOffset, y: endPos.y };
    
    const path = `M ${connectionStart.position.x} ${connectionStart.position.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endPos.x} ${endPos.y}`;
    
    return (
      <g style={{ pointerEvents: 'none', zIndex: 1000 }}>
        <path
          d={path}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      </g>
    );
  };
  
  // 渲染选择框
  const renderSelectionBox = () => {
    if (!selectionBox) return null;
    
    // 直接使用屏幕坐标，不需要转换
    const x = Math.min(selectionBox.start.x, selectionBox.end.x);
    const y = Math.min(selectionBox.start.y, selectionBox.end.y);
    const width = Math.abs(selectionBox.end.x - selectionBox.start.x);
    const height = Math.abs(selectionBox.end.y - selectionBox.start.y);
    
    return (
      <g style={{ pointerEvents: 'none', zIndex: 1000 }}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3b82f6"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      </g>
    );
  };
  
  return (
    <div 
      ref={canvasRef}
      className="w-full h-full bg-gray-100 relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          cursor: isDraggingCanvas ? 'grabbing' : 'grab'
        }}
      >
        {/* 网格背景 */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
        />
        
        {/* 平移和缩放变换组 */}
        <g
          transform={`translate(${canvas.x}, ${canvas.y}) scale(${canvas.zoom})`}
        >
          {/* 渲染连线 */}
          {connections.map((connection: ConnectionType) => (
            <Connection key={connection.id} connection={connection} />
          ))}
          
          {/* 渲染临时连线 */}
          {renderTempConnection()}
          
          {/* 渲染节点 */}
          {nodes.map((node: NodeType) => (
            <Node key={node.id} node={node} />
          ))}
        </g>
        
        {/* 渲染选择框（在变换组之外，避免缩放影响） */}
        {renderSelectionBox()}
      </svg>
    </div>
  );
};

export default Canvas;