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
      cleanUsername.length < 3 ||
      cleanUsername.length > 32
    ) {
      return json(res, 400, {
        error:
          "Používateľské meno musí mať 3–32 znakov."
      });
    }

    if (
      !/^[a-zA-Z0-9_.-]+$/.test(
        cleanUsername
      )
    ) {
      return json(res, 400, {
        error:
          "Používateľské meno obsahuje nepovolené znaky."
      });
    }

    if (
      !password ||
      password.length < 6
    ) {
      return json(res, 400, {
        error:
          "Heslo musí mať minimálne 6 znakov."
      });
    }

    if (
      cleanUsername.toLowerCase() === "admin"
    ) {
      return json(res, 400, {
        error:
          "Toto používateľské meno je rezervované."
      });
    }

    const existing = await sql`
      SELECT id
      FROM users
      WHERE LOWER(username) =
            LOWER(${cleanUsername})
    `;

    if (existing.rowCount > 0) {
      return json(res, 409, {
        error:
          "Používateľ už existuje."
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await sql`
        INSERT INTO users
          (
            username,
            password_hash,
            is_admin
          )
        VALUES
          (
            ${cleanUsername},
            ${passwordHash},
            FALSE
          )
        RETURNING id, username, is_admin
      `;

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
          ${user.rows[0].id},
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
