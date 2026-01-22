// call-node-red-api.js：Trae 中调用 Node-RED 接口的示例
// 先安装 axios 依赖：npm install axios
import axios from 'axios';

// 调用 Node-RED 搭建的 HTTP 接口
async function callNodeRedApi(num) {
    try {
        const response = await axios.get('http://127.0.0.1:1882/api/calculate', {
            params: { num: num }  // 传递请求参数 num
        });
        console.log('Node-RED 接口返回结果：', response.data);
        return response.data;
    } catch (error) {
        console.error('调用 Node-RED 接口失败：', error.message);
        throw error;
    }
}

// 测试调用（传递参数 8）
callNodeRedApi(8);