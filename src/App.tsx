import { useEffect } from 'react';
import Canvas from './components/Canvas/Canvas';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';
import './App.css';
import { useEditorStore } from './store/editorStore';

function App() {
  const { state, deleteNode, clearSelection } = useEditorStore();
  const { selectedNodeIds } = state;
  
  // 添加键盘事件监听，处理del键删除节点
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在有选中节点时处理
      if (selectedNodeIds.length === 0) return;
      
      // 处理delete或backspace键
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // 删除所有选中的节点
        selectedNodeIds.forEach(nodeId => {
          deleteNode(nodeId);
        });
        // 清除选择
        clearSelection();
      }
    };
    
    // 添加全局键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理事件监听
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeIds, deleteNode, clearSelection]);
  
  return (
    <div className="App flex flex-col h-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Canvas />
        </div>
      </div>
    </div>
  );
}

export default App