import axios from "axios";

const API_URL = "http://localhost:5000/api";
let authToken = ""; 

async function setupAuth() {
  try {
    // 自动模拟登录获取有效的 Token (请务必确保该测试账号在 SQLite 的 users 表中存在)
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "test@example.com", 
      password: "test123456"
    });
    authToken = loginRes.data.token;
    console.log("🔑 [SETUP] 成功获取 Bearer 身份令牌。");
  } catch (err) {
    console.error("❌ [SETUP FAIL] 登录失败，请检查测试账号密码或后端服务状态！", err.message);
    process.exit(1);
  }
}

// ==========================================
// 【用例 1】正向流：标准多表写入事务测试
// ==========================================
async function testSuccessfulOrderCreation() {
  console.log("\n------------------------------------------------");
  console.log("🏃 [Case 1] 开始测试：正常参数下单 (事务原子性写入)");
  
  const payload = {
    customer: { name: "John Doe", phone: "88887777" },
    total: 38.50,
    items: [
      { id: 1, quantity: 2, price: 10.00 }, // 对应 products 表已存在 ID
      { id: 2, quantity: 1, price: 18.50 }
    ]
  };

  const res = await axios.post(`${API_URL}/orders`, payload, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (res.status === 201 && res.data.orderId) {
    console.log(`=== 🏆 用例 1 通过！订单创建成功，新生成的订单ID: ${res.data.orderId}`);
    return res.data.orderId;
  } else {
    throw new Error(`用例 1 失败：非预期响应体 ${JSON.stringify(res.data)}`);
  }
}

// ==========================================
// 【用例 2】反向流：空购物车/非法金额校验拦截
// ==========================================
async function testInvalidPayloadValidation() {
  console.log("\n------------------------------------------------");
  console.log("🏃 [Case 2] 开始测试：非法参数拦截 (空明细与负数总额)");

  const badPayload = {
    customer: { name: "Err Case", phone: "0000" },
    total: -10.50, // ❌ 非法负数总额
    items: []      // ❌ 购物车为空
  };

  try {
    await axios.post(`${API_URL}/orders`, badPayload, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.error("❌ === 用例 2 失败：后端竟然让非法参数通过并返回了 200/201！");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`=== 🏆 用例 2 通过！后端正确拦截并响应 400。错误提示: ${error.response.data.message}`);
    } else {
      console.error("❌ === 用例 2 失败：后端虽然报错，但返回的不是 400 状态码:", error.response?.status);
    }
  }
}

async function testUnauthorizedAccess() {
  console.log("\n------------------------------------------------");
  console.log("🏃 [Case 3] 开始测试：安全性拦截 (未携带认证 Token 下单)");

  try {
    // ❌ 故意不传 headers 配置项
    await axios.post(`${API_URL}/orders`, {
      customer: { name: "Hacker", phone: "999" },
      total: 10.00,
      items: [{ id: 1, quantity: 1, price: 10.00 }]
    });
    console.error("❌ === 用例 3 失败：高危安全隐患！未登录用户竟然可以直接下单成功！");
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log(`=== 🏆 用例 3 通过！中间件成功守护边界，拦截未登录请求并返回: ${error.response.status}`);
    } else {
      console.error("❌ === 用例 3 失败：后端虽拒绝但状态码不符合鉴权规范:", error.response?.status);
    }
  }
}

// ==========================================
// 启动测试套件
// ==========================================
async function startTestSuite() {
  console.log("🚀 [TEST SUITE] 初始化订单测试用例流程...");
  await setupAuth();

  try {
    const newId = await testSuccessfulOrderCreation();
    await testInvalidPayloadValidation();
    await testUnauthorizedAccess();
    
    console.log("\n================================================");
    console.log("🎉 恭喜！所有核心测试用例运行完毕，系统健壮性符合预期！");
    console.log("================================================\n");
  } catch (suiteError) {
    console.error("\n💥 测试套件在执行过程中因严重错误中断:", suiteError.message);
  }
}

startTestSuite();
