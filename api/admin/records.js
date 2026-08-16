const {
  sql,
  getSession,
  json
} = require("../_lib");

module.exports = async (req, res) => {

  if (req.method !== "GET") {
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

    const pending = await sql`
      SELECT
        id,
        name,
        nick,
        level,
        progress,
        status,
        video_name AS "videoName",
        video_url AS "videoUrl",
        created_at
      FROM records
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `;

    const all = await sql`
      SELECT
        id,
        name,
        nick,
        level,
        progress,
        status,
        video_name AS "videoName",
        video_url AS "videoUrl",
        created_at
      FROM records
      ORDER BY created_at DESC
    `;

    return json(res, 200, {
      pending: pending.rows,
      all: all.rows
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error: "Chyba databázy."
    });

  }

};
