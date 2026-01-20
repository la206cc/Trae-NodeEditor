import React from 'react';
import { Connection as ConnectionType } from '../../types';
import { useEditorStore } from '../../store/editorStore';

interface ConnectionProps {
  connection: ConnectionType;
}

const Connection: React.FC<ConnectionProps> = ({ connection }) => {
  const { state, deleteConnection } = useEditorStore();
  const { nodes } = state;
  
  // 获取节点
  const fromNode = nodes.find(n => n.id === connection.fromNodeId);
  const toNode = nodes.find(n => n.id === connection.toNodeId);
  
  if (!fromNode || !toNode) return null;
  
  // 获取端口
  const fromPort = fromNode.outputs.find(p => p.id === connection.fromPortId);
  const toPort = toNode.inputs.find(p => p.id === connection.toPortId);
  
  if (!fromPort || !toPort) return null;
  
  // 计算端口位置
  const calculatePortPosition = (node: typeof fromNode, port: typeof fromPort, isInput: boolean) => {
    const portList = isInput ? node.inputs : node.outputs;
    const portIndex = portList.findIndex(p => p.id === port.id);
    const totalPorts = portList.length;
    const y = node.y + 30 + (node.height - 40) * (portIndex + 0.5) / totalPorts;
    const x = isInput ? node.x : node.x + node.width;
    return { x, y };
  };
  
  const fromPos = calculatePortPosition(fromNode, fromPort, false);
  const toPos = calculatePortPosition(toNode, toPort, true);
  
  // 计算贝塞尔曲线控制点
  const controlPointOffset = 50;
  const controlPoint1 = { x: fromPos.x + controlPointOffset, y: fromPos.y };
  const controlPoint2 = { x: toPos.x - controlPointOffset, y: toPos.y };
  
  // 生成路径
  const path = `M ${fromPos.x} ${fromPos.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${toPos.x} ${toPos.y}`;
  
  // 处理连线点击
  const handleConnectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConnection(connection.id);
  };
  
  return (
    <g className="cursor-pointer">
      <path
        d={path}
        fill="none"
        stroke="#6b7280"
        strokeWidth={2}
        onMouseDown={handleConnectionClick}
      />
    </g>
  );
};

export default Connection;