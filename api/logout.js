const {
    pool,
    getSessionToken,
    clearSessionCookie,
    json
} = require("./_lib");

module.exports = async function handler(req,res){

    if(req.method !== "POST")
        return json(res,405,{
            error:"Method not allowed"
        });

    try{

        const token =
            getSessionToken(req);

        if(token){

            await pool.query(
                `
                DELETE FROM sessions
                WHERE token=$1
                `,
                [token]
            );

        }

        clearSessionCookie(res);

        return json(res,200,{
            success:true
        });

    }catch(error){

        console.error(error);

        clearSessionCookie(res);

        return json(res,200,{
            success:true
        });

    }

};
