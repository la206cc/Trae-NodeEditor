// parse-node-red-flow.js：解析 Node-RED 流程配置，展示节点连接逻辑
import fs from 'fs';
import path from 'path';

// 读取 Node-RED 导出的流程文件
const flowPath = path.join(process.cwd(), 'node-red-flow.json');
const flowData = JSON.parse(fs.readFileSync(flowPath, 'utf8'));

// 提取节点信息和连接关系（wires 字段为节点连线关系，二维数组）
const nodeConnections = flowData.map(node => ({
    nodeId: node.id,          // 节点唯一ID
    nodeType: node.type,      // 节点类型（如 http in、function）
    nodeName: node.name || '未命名节点',  // 节点名称（无则显示默认值）
    targetNodeIds: node.wires ? node.wires.flat() : []  // 连接的目标节点ID（扁平化数组）
}));

// 在 Trae 终端打印节点连接逻辑
console.log('==================== Node-RED 节点连接逻辑 ====================');
console.log(JSON.stringify(nodeConnections, null, 2));
console.log('==============================================================');
console.log('说明：targetNodeIds 数组中的值为当前节点连接的目标节点ID，可对应上方 nodeId 查找目标节点');