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
                error:"Vyplň používateľské meno a heslo."
            });

        if(user.length < 3 || user.length > 32)
            return json(res,400,{
                error:"Používateľské meno musí mať 3–32 znakov."
            });

        if(pass.length < 6)
            return json(res,400,{
                error:"Heslo musí mať minimálne 6 znakov."
            });

        if(user.toLowerCase() === "admin")
            return json(res,400,{
                error:"Meno admin je rezervované."
            });

        const existing =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(username)=LOWER($1)
                LIMIT 1
                `,
                [user]
            );

        if(existing.rows.length)
            return json(res,409,{
                error:"Používateľ už existuje."
            });

        const inserted =
            await pool.query(
                `
                INSERT INTO users
                    (username,password_hash,is_admin)
                VALUES
                    ($1,crypt($2,gen_salt('bf',12)),FALSE)
                RETURNING id,username,is_admin
                `,
                [user,pass]
            );

        const dbUser =
            inserted.rows[0];

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

        return json(res,201,{
            user:{
                id:dbUser.id,
                username:dbUser.username,
                admin:dbUser.is_admin
            }
        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:"Server error pri registrácii."
        });

    }

};
