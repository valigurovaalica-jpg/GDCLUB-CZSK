const {
  sql,
  bcrypt,
  json
} = require("./_lib");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed"
    });
  }

  try {

    const username = "admin";
    const password = "Abarth555";

    const existing = await sql`
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
    `;

    if (existing.rowCount > 0) {

      return json(res, 409, {
        error: "Admin účet už existuje."
      });

    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const result = await sql`
      INSERT INTO users (
        username,
        password_hash,
        is_admin
      )
      VALUES (
        ${username},
        ${passwordHash},
        TRUE
      )
      RETURNING id, username, is_admin
    `;

    return json(res, 201, {
      ok: true,
      user: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error: "Nepodarilo sa vytvoriť admin účet."
    });

  }

};
