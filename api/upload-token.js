const { handleUpload } = require("@vercel/blob/client");
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

    const body = req.body || {};

    const response = await handleUpload({
      body,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "video/*"
          ],
          maximumSizeInBytes:
            1024 * 1024 * 1024,

          addRandomSuffix: true
        };
      },
      onUploadCompleted: async ({
        blob
      }) => {
        console.log(
          "VIDEO UPLOADED:",
          blob.url
        );
      }
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error(
      "UPLOAD TOKEN ERROR:",
      error
    );

    return json(res, 500, {
      error:
        "Nepodarilo sa pripraviť upload."
    });
  }
};
