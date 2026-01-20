import React from 'react';
import { useEditorStore } from '../../store/editorStore';

const Toolbar: React.FC = () => {
  const { state, setCanvasZoom, setCanvasPosition } = useEditorStore();
  const { canvas } = state;
  
  // 处理缩放操作
  const handleZoomIn = () => {
    setCanvasZoom(canvas.zoom * 1.1);
  };
  
  const handleZoomOut = () => {
    setCanvasZoom(canvas.zoom * 0.9);
  };
  
  const handleResetView = () => {
    setCanvasPosition(0, 0);
    setCanvasZoom(1);
  };
  
  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 space-x-2">
      <div className="flex items-center space-x-2">
        <button
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={handleZoomIn}
          title="放大"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={handleZoomOut}
          title="缩小"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={handleResetView}
          title="重置视图"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-gray-600 ml-4">
        缩放: {(canvas.zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default Toolbar;