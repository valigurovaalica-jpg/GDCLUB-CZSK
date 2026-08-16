const {
    pool,
    randomToken,
    setSessionCookie,
    json
} = require("./_lib");

module.exports = async function handler(req,res){

    if(req.method !== "POST")
        return json(res,405,{
            error:"Method not allowed"
        });

    try{

        const {
            username,
            password
        } = req.body || {};

        const user =
            String(username || "").trim();

        const pass =
            String(password || "");

        if(!user || !pass)
            return json(res,400,{
                error:"Vyplň meno a heslo."
            });

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    username,
                    password_hash,
                    is_admin
                FROM users
                WHERE LOWER(username)=LOWER($1)
                LIMIT 1
                `,
                [user]
            );

        if(!result.rows.length)
            return json(res,401,{
                error:"Nesprávne meno alebo heslo."
            });

        const dbUser =
            result.rows[0];

        const check =
            await pool.query(
                `
                SELECT
                    crypt($1,$2) = $2 AS valid
                `,
                [
                    pass,
                    dbUser.password_hash
                ]
            );

        if(!check.rows[0].valid)
            return json(res,401,{
                error:"Nesprávne meno alebo heslo."
            });

        const token =
            randomToken();

        await pool.query(
            `
            INSERT INTO sessions
                (token,user_id,expires_at)
            VALUES
                (
                    $1,
                    $2,
                    NOW() + INTERVAL '30 days'
                )
            `,
            [
                token,
                dbUser.id
            ]
        );

        setSessionCookie(
            res,
            token
        );

        return json(res,200,{
            user:{
                id:dbUser.id,
                username:dbUser.username,
                admin:dbUser.is_admin
            }
        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:"Server error pri prihlasovaní."
        });

    }

};
