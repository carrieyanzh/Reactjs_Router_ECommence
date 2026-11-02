import axios from "axios";

// 1. 从环境变量载入我们在 Render 面板配置的 Cloudflare 凭证
const accountId = process.env.CF_ACCOUNT_ID;
const databaseId = process.env.CF_DATABASE_ID;
const apiToken = process.env.CF_API_TOKEN;

// 检查变量是否正确加载
if (!accountId || !databaseId || !apiToken) {
  console.error("❌ [D1 CONFIG ERROR] Cloudflare 环境变量缺失，请检查 Render 面板配置！");
} else {
  console.log("✅ [D1 CONFIG] Cloudflare D1 远程数据库服务初始化成功。");
}

/**
 * 核心数据库执行函数，完美平替本地 sqlite 的执行模式
 * @param {string} sql - 需要执行的 SQL 语句 (例如 "SELECT * FROM products WHERE id = ?")
 * @param {Array} params - 对应的参数数组 (例如)
 * @returns {Promise<Array>} 返回查询结果数组
 */
export const query = async (sql, params = []) => {
  const url = `https://cloudflare.com{accountId}/d1/database/${databaseId}/query`;

  try {
    const response = await axios.post(
      url,
      {
        sql: sql,
        params: params,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      // D1 返回的格式中，结果存储在 result[0].results 中
      const resultData = response.data.result[0];
      return resultData.results || [];
    } else {
      throw new Error(response.data?.errors?.[0]?.message || "D1 远程查询失败");
    }
  } catch (error) {
    console.error("❌ [D1 Query Error]:", error.response?.data || error.message);
    throw error;
  }
};

// 预留一个兼容某些老代码的默认导出
export default { query };
