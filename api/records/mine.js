const {
  sql,
  getSession,
  json
} = require("../_lib");

module.exports = async (req, res) => {

  try {

    const user =
      await getSession(req);

    if (!user) {

      return json(res, 401, {
        error:
          "Nie si prihlásený."
      });

    }

    const records =
      await sql`
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
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;

    return json(res, 200, {
      records: records.rows
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Chyba databázy."
    });

  }

};
