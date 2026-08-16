const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const {
    createClient
} = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const BUCKET =
    process.env.SUPABASE_BUCKET || "videos";

const SESSION_DAYS = 30;

function parseCookies(req) {

    const header =
        req.headers.cookie || "";

    const cookies = {};

    header
        .split(";")
        .forEach(part => {

            const index =
                part.indexOf("=");

            if(index === -1)
                return;

            const key =
                part
                .slice(0,index)
                .trim();

            const value =
                part
                .slice(index + 1)
                .trim();

            cookies[key] =
                decodeURIComponent(value);

        });

    return cookies;
}


function getSessionToken(req) {

    const cookies =
        parseCookies(req);

    return cookies.gd_session || null;
}


async function getUser(req) {

    const token =
        getSessionToken(req);

    if(!token)
        return null;

    const result =
        await pool.query(
            `
            SELECT
                u.id,
                u.username,
                u.is_admin
            FROM sessions s
            JOIN users u
                ON u.id = s.user_id
            WHERE s.token = $1
              AND s.expires_at > NOW()
            LIMIT 1
            `,
            [token]
        );

    if(!result.rows.length)
        return null;

    return {
        id: result.rows[0].id,
        username: result.rows[0].username,
        admin: result.rows[0].is_admin
    };
}


function setSessionCookie(
    res,
    token
) {

    const maxAge =
        SESSION_DAYS * 24 * 60 * 60;

    res.setHeader(
        "Set-Cookie",
        [
            `gd_session=${encodeURIComponent(token)}`,
            `Path=/`,
            `HttpOnly`,
            `Secure`,
            `SameSite=Lax`,
            `Max-Age=${maxAge}`
        ].join("; ")
    );
}


function clearSessionCookie(res) {

    res.setHeader(
        "Set-Cookie",
        [
            "gd_session=",
            "Path=/",
            "HttpOnly",
            "Secure",
            "SameSite=Lax",
            "Max-Age=0"
        ].join("; ")
    );
}


function json(
    res,
    status,
    data
) {

    res.status(status);

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    return res.json(data);
}


function randomToken() {

    return require("crypto")
        .randomBytes(48)
        .toString("hex");

}


module.exports = {
    pool,
    supabase,
    BUCKET,
    SESSION_DAYS,
    getUser,
    getSessionToken,
    setSessionCookie,
    clearSessionCookie,
    json,
    randomToken
};
