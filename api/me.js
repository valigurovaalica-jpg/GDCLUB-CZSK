const {
  getSession,
  json
} = require("./_lib");

module.exports = async (req, res) => {

  try {

    const user =
      await getSession(req);

    if (!user) {

      return json(res, 200, {
        user: null
      });

    }

    return json(res, 200, {
      user: {
        id: user.id,
        username: user.username,
        admin: Boolean(
          user.is_admin
        )
      }
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Chyba servera."
    });

  }

};
