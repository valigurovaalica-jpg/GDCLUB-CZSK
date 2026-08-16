const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function json(res, status, data) {
  res.status(status).json(data);
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const match = cookies.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")
  );

  return match ? decodeURIComponent(match[1]) : null;
}

async function getSession(req) {
  const token = getCookie(req, "gd_session");

  if (!token) {
    return null;
  }

  const result = await sql`
    SELECT
      u.id,
      u.username,
      u.is_admin
    FROM sessions s
    JOIN users u
      ON u.id = s.user_id
    WHERE
      s.token = ${token}
      AND s.expires_at > NOW()
  `;

  return result.rows[0] || null;
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `gd_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    "gd_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );
}

module.exports = {
  sql,
  bcrypt,
  json,
  getCookie,
  getSession,
  createToken,
  setSessionCookie,
  clearSessionCookie
};
