const { createUploadToken } = require("@vercel/blob/client");
const {
  getSession,
  json
} = require("./_lib");

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
        error: "Najprv sa prihlás."
      });
    }

    if (user.is_admin) {
      return json(res, 403, {
        error: "Admin nemôže nahrávať rekordy."
      });
    }

    const token = await createUploadToken({
      allowedContentTypes: [
        "video/*"
      ],
      maximumSizeInBytes:
        1024 * 1024 * 1024,

      addRandomSuffix: true,

      onUploadCompleted: async ({
        blob
      }) => {
        console.log(
          "VIDEO UPLOADED:",
          blob.url
        );
      }
    });

    return json(res, 200, {
      token
    });

  } catch (error) {
    console.error(
      "UPLOAD TOKEN ERROR:",
      error
    );

    return json(res, 500, {
      error:
        "Nepodarilo sa vytvoriť upload token."
    });
  }
};
