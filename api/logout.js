const {
  sql,
  getCookie,
  clearSessionCookie,
  json
} = require("./_lib");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed"
    });
  }

  try {

    const token =
      getCookie(
        req,
        "gd_session"
      );

    if (token) {

      await sql`
        DELETE FROM sessions
        WHERE token = ${token}
      `;

    }

    clearSessionCookie(res);

    return json(res, 200, {
      ok: true
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Chyba servera."
    });

  }

};
