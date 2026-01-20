import React, { useState, useEffect } from 'react';
import { Node } from '../../types';
import { useEditorStore } from '../../store/editorStore';

interface NodeDescriptionEditorProps {
  node: Node;
}

const NodeDescriptionEditor: React.FC<NodeDescriptionEditorProps> = ({ node }) => {
  const { state, updateNode, setEditingNodeId } = useEditorStore();
  const { editingNodeId } = state;
  const [description, setDescription] = useState(node.description);
  
  // 当全局编辑状态变化时，更新本地描述状态
  useEffect(() => {
    if (editingNodeId === node.id) {
      setDescription(node.description);
    }
  }, [editingNodeId, node.id, node.description]);
  
  // 处理编辑开始
  const handleEditStart = () => {
    // 设置当前节点为编辑状态
    setEditingNodeId(node.id);
  };
  
  // 处理编辑结束
  const handleEditEnd = () => {
    // 退出编辑状态
    setEditingNodeId(null);
    updateNode(node.id, { description });
  };
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  
  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditEnd();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // 退出编辑状态，恢复原始描述
      setEditingNodeId(null);
    }
  };
  
  // 判断当前节点是否处于编辑状态
  const isEditing = editingNodeId === node.id;
  
  if (isEditing) {
    return (
      <foreignObject
        x={10}
        y={35}
        width={node.width - 20}
        height={node.height - 50}
      >
        <textarea
          className="w-full h-full p-1 text-xs border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={description}
          onChange={handleInputChange}
          onBlur={handleEditEnd}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </foreignObject>
    );
  }
  
  return (
    <g className="cursor-pointer">
      <text
        x={10}
        y={45}
        textAnchor="start"
        className="text-xs text-gray-500"
        fill="#6b7280"
        onClick={handleEditStart}
      >
        {node.description || '点击编辑描述...'}
      </text>
      {!node.description && (
        <text
          x={10}
          y={60}
          textAnchor="start"
          className="text-xs text-gray-400 italic"
          fill="#9ca3af"
        >
          输入自然语言描述节点功能
        </text>
      )}
    </g>
  );
};

export default NodeDescriptionEditor;