const {
    pool,
    getUser,
    json
} = require("../_lib");

module.exports = async function handler(req,res){

    if(req.method !== "POST")
        return json(res,405,{
            error:"Method not allowed"
        });

    try{

        const user =
            await getUser(req);

        if(!user)
            return json(res,401,{
                error:"Musíš byť prihlásený."
            });

        if(user.admin)
            return json(res,403,{
                error:"Admin účet nemôže odosielať rekordy."
            });

        const {
            name,
            nick,
            level,
            progress,
            videoName,
            videoUrl
        } = req.body || {};

        const cleanName =
            String(name || "").trim();

        const cleanNick =
            String(nick || "").trim();

        const cleanLevel =
            String(level || "").trim();

        const cleanVideoName =
            String(videoName || "").trim();

        const cleanVideoUrl =
            String(videoUrl || "").trim();

        const prog =
            Number(progress);

        if(!cleanName ||
           !cleanNick ||
           !cleanLevel ||
           !cleanVideoName ||
           !cleanVideoUrl){

            return json(res,400,{
                error:"Všetky polia sú povinné."
            });

        }

        if(
            cleanName.length > 80 ||
            cleanNick.length > 32 ||
            cleanLevel.length > 120
        ){

            return json(res,400,{
                error:"Niektoré pole je príliš dlhé."
            });

        }

        if(
            !Number.isInteger(prog) ||
            prog < 0 ||
            prog > 100
        ){

            return json(res,400,{
                error:"Progress musí byť 0–100."
            });

        }

        /*
         * Povolené sú iba Supabase Storage URL.
         */

        const supabaseUrl =
            process.env.SUPABASE_URL;

        if(
            !cleanVideoUrl.startsWith(
                supabaseUrl +
                "/storage/"
            )
        ){

            return json(res,400,{
                error:"Neplatná URL videa."
            });

        }

        const result =
            await pool.query(
                `
                INSERT INTO records
                (
                    user_id,
                    name,
                    nick,
                    level,
                    progress,
                    status,
                    video_name,
                    video_url
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    'pending',
                    $6,
                    $7
                )
                RETURNING
                    id,
                    status,
                    created_at
                `,
                [
                    user.id,
                    cleanName,
                    cleanNick,
                    cleanLevel,
                    prog,
                    cleanVideoName,
                    cleanVideoUrl
                ]
            );

        return json(res,201,{
            success:true,
            record:result.rows[0]
        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:
                "Server error pri ukladaní rekordu."
        });

    }

};
