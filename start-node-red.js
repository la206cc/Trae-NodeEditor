// start-node-red.js：Trae IDE 中启动 Node-RED 服务的自定义脚本
import { exec } from 'child_process';

// 启动 Node-RED，指定端口 1882（可修改为其他未占用端口）
const nodeRedProcess = exec('node-red -p 1882');

// 监听 Node-RED 输出日志，在 Trae 终端显示
nodeRedProcess.stdout.on('data', (data) => {
    console.log('[Node-RED 日志]：', data);
});

// 监听错误信息，在 Trae 终端显示错误日志
nodeRedProcess.stderr.on('data', (data) => {
    console.error('[Node-RED 错误]：', data);
});

// 当 Trae 关闭终端时，自动终止 Node-RED 服务（避免后台残留进程）
process.on('exit', () => {
    nodeRedProcess.kill();
    console.log('[Node-RED 服务]：已正常关闭');
});