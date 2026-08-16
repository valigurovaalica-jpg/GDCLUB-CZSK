const {
  sql,
  bcrypt,
  json,
  createToken,
  setSessionCookie
} = require("./_lib");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed"
    });
  }

  try {

    const {
      username,
      password
    } = req.body || {};

    const cleanUsername =
      String(username || "").trim();

    if (
      !cleanUsername ||
      !password
    ) {
      return json(res, 400, {
        error:
          "Vyplň meno aj heslo."
      });
    }

    const result =
      await sql`
        SELECT
          id,
          username,
          password_hash,
          is_admin
        FROM users
        WHERE LOWER(username) =
              LOWER(${cleanUsername})
      `;

    if (result.rowCount === 0) {
      return json(res, 401, {
        error:
          "Nesprávne meno alebo heslo."
      });
    }

    const user =
      result.rows[0];

    const valid =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!valid) {
      return json(res, 401, {
        error:
          "Nesprávne meno alebo heslo."
      });
    }

    const token =
      createToken();

    await sql`
      INSERT INTO sessions
        (
          token,
          user_id,
          expires_at
        )
      VALUES
        (
          ${token},
          ${user.id},
          NOW() + INTERVAL '30 days'
        )
    `;

    setSessionCookie(
      res,
      token
    );

    return json(res, 200, {
      ok: true
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Chyba databázy."
    });

  }

};
