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
        error: "Najprv sa musíš prihlásiť."
      });
    }

    if (user.is_admin) {
      return json(res, 403, {
        error: "Admin nemôže odosielať rekordy."
      });
    }

    const {
      name,
      nick,
      level,
      progress,
      videoName,
      videoUrl
    } = req.body || {};

    if (
      !name ||
      !nick ||
      !level ||
      progress === undefined ||
      progress === null
    ) {
      return json(res, 400, {
        error: "Vyplň všetky povinné polia."
      });
    }

    const progressNumber =
      Number(progress);

    if (
      !Number.isInteger(progressNumber) ||
      progressNumber < 0 ||
      progressNumber > 100
    ) {
      return json(res, 400, {
        error: "Progress musí byť číslo 0–100."
      });
    }

    const result = await sql`
      INSERT INTO records (
        user_id,
        name,
        nick,
        level,
        progress,
        status,
        video_name,
        video_url
      )
      VALUES (
        ${user.id},
        ${String(name).trim()},
        ${String(nick).trim()},
        ${String(level).trim()},
        ${progressNumber},
        'pending',
        ${videoName || null},
        ${videoUrl || null}
      )
      RETURNING
        id,
        name,
        nick,
        level,
        progress,
        status,
        video_name AS "videoName",
        video_url AS "videoUrl",
        created_at
    `;

    return json(res, 201, {
      ok: true,
      record: result.rows[0]
    });

  } catch (error) {
    console.error("SUBMIT RECORD ERROR:", error);

    return json(res, 500, {
      error: "Server error pri pridávaní rekordu."
    });
  }
};
