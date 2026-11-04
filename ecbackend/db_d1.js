import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const accountId = process.env.CF_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID 
const databaseId = process.env.CF_DATABASE_ID || process.env.CLOUDFLARE_DATABASE_ID
const apiToken = process.env.CF_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !databaseId || !apiToken) {
  throw new Error(
    "Missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_API_TOKEN in environment"
  );
}

console.log("✅ [D1 CONFIG] Cloudflare D1 智能网络引擎加载成功。");

const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

const post = async (body) => {
  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
    if (!response.data?.success) {
      throw new Error(response.data?.errors?.[0]?.message || "D1 响应异常");
    }
    return response.data.result;
  } catch (error) {
    const d1Errors = error.response?.data?.errors;
    console.error("❌ [D1 ERROR]", error.response?.status, JSON.stringify(d1Errors) || error.message);

    // 抛出干净的错误，不带 Axios 的 config，避免日志泄露 Token
    const clean = new Error(d1Errors?.[0]?.message || error.message);
    clean.status = error.response?.status;
    clean.d1Errors = d1Errors;
    throw clean;
  }
};

const cleanParams = (params = []) => params.map((v) => (v === undefined ? null : v));

// 兼容 execute("sql", [..]) 和 execute({ sql, args })
export const execute = async (sqlOrObj, params = []) => {
  let sql = sqlOrObj;
  let args = params;
  if (typeof sqlOrObj === "object" && sqlOrObj !== null) {
    sql = sqlOrObj.sql;
    args = sqlOrObj.args ?? sqlOrObj.params ?? [];
  }

  const result = await post({ sql, params: cleanParams(args) });
  const first = Array.isArray(result) ? result[0] : result;
  const rows = first?.results ?? [];
  const meta = first?.meta ?? {};

  return {
    rows,
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    meta,
    rowsAffected: meta.changes ?? 0,           // 兼容 libSQL 写法
    lastInsertRowid: meta.last_row_id ?? null, // 兼容 libSQL 写法
  };
};

export const query = async (sqlOrObj, params = []) => {
  const { rows } = await execute(sqlOrObj, params);
  return rows;
};

// 一个 batch = 一个事务，任意一条失败则整批回滚
export const batch = async (statements) => {
  if (!Array.isArray(statements) || statements.length === 0) {
    throw new Error("batch requires at least one statement");
  }
  const result = await post({
    batch: statements.map((s) => ({ sql: s.sql, params: cleanParams(s.params) })),
  });
  return result.map((r) => ({
    rows: r.results ?? [],
    meta: r.meta ?? {},
  }));
};

export default { execute, query, batch };