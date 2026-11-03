import axios from "axios";

const accountId = process.env.CF_ACCOUNT_ID;
const databaseId = process.env.CF_DATABASE_ID;
const apiToken = process.env.CF_API_TOKEN;

if (!accountId || !databaseId || !apiToken) {
  console.error("❌ [D1 CONFIG ERROR] Cloudflare env variables: CF_ACCOUNT_ID, CF_DATABASE_ID, CF_API_TOKEN lack. please check the Render panel configuration");
} else {
  console.log("✅ [D1 CONFIG] Cloudflare D1 Render panel configuration loaded: CF_ACCOUNT_ID, CF_DATABASE_ID, CF_API_TOKEN successfully.");
}

/** 
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
      const resultData = Array.isArray(response.data.result) 
        ? response.data.result[0] 
        : response.data.result;
        
      return resultData?.results || [];
    } else {
      throw new Error(response.data?.errors?.[0]?.message || "D1 remote query failed");
    }
  } catch (error) {
    console.error("❌ [D1 Query Error]:", error.response?.data || error.message);
    throw error;
  }
};

export default { query };
