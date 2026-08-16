const {
  sql,
  json
} = require("./_lib");

module.exports = async (req, res) => {

  try {

    const records =
      await sql`
        SELECT
          id,
          name,
          nick,
          level,
          progress,
          video_name AS "videoName",
          video_url AS "videoUrl",
          created_at
        FROM records
        WHERE status = 'approved'
        ORDER BY created_at DESC
      `;

    const members =
      await sql`
        SELECT COUNT(*)::int AS count
        FROM users
        WHERE is_admin = FALSE
      `;

    return json(res, 200, {
      records: records.rows,
      members:
        members.rows[0].count
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Chyba databázy."
    });

  }

};
