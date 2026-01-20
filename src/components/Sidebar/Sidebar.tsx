import React from 'react';
import { nodeTemplates } from '../../store/editorStore';
import { NodeTemplate } from '../../types';

const Sidebar: React.FC = () => {
  // 处理节点拖拽开始
  const handleDragStart = (e: React.DragEvent, template: NodeTemplate) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">节点库</h2>
      <div className="space-y-3">
        {nodeTemplates.map((template) => (
          <div
            key={template.id}
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-blue-50 hover:border-blue-300 transition-all"
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
          >
            <h3 className="font-medium text-gray-800">{template.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;