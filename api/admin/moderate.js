const {
  sql,
  getSession,
  json
} = require("../_lib");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed"
    });
  }

  try {

    const user = await getSession(req);

    if (!user) {
      return json(res, 401, {
        error: "Nie si prihlásený."
      });
    }

    if (!user.is_admin) {
      return json(res, 403, {
        error: "Nemáš oprávnenie."
      });
    }

    const {
      id,
      status
    } = req.body || {};

    if (!id) {
      return json(res, 400, {
        error: "Chýba ID rekordu."
      });
    }

    if (
      status !== "approved" &&
      status !== "rejected"
    ) {
      return json(res, 400, {
        error: "Neplatný stav."
      });
    }

    const result = await sql`
      UPDATE records
      SET
        status = ${status},
        reviewed_at = NOW(),
        reviewed_by = ${user.id}
      WHERE id = ${id}
      RETURNING id, status
    `;

    if (result.rowCount === 0) {
      return json(res, 404, {
        error: "Rekord neexistuje."
      });
    }

    return json(res, 200, {
      ok: true,
      record: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error: "Chyba databázy."
    });

  }

};
