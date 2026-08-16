const {
    pool,
    getUser,
    json
} = require("../_lib");

module.exports = async function handler(req,res){

    if(req.method !== "GET")
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

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    nick,
                    level,
                    progress,
                    status,
                    video_name,
                    video_url,
                    created_at,
                    reviewed_at
                FROM records
                WHERE user_id=$1
                ORDER BY created_at DESC
                `,
                [user.id]
            );

        return json(res,200,{

            records:
                result.rows.map(r => ({
                    id:r.id,
                    name:r.name,
                    nick:r.nick,
                    level:r.level,
                    progress:r.progress,
                    status:r.status,
                    videoName:r.video_name,
                    videoUrl:r.video_url,
                    createdAt:r.created_at,
                    reviewedAt:r.reviewed_at
                }))

        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:"Server error."
        });

    }

};
