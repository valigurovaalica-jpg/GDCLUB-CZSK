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

        if(!user || !user.admin)
            return json(res,403,{
                error:"Nemáš oprávnenie."
            });

        const result =
            await pool.query(
                `
                SELECT
                    r.id,
                    r.name,
                    r.nick,
                    r.level,
                    r.progress,
                    r.status,
                    r.video_name,
                    r.video_url,
                    r.created_at,
                    u.username
                FROM records r
                JOIN users u
                    ON u.id=r.user_id
                ORDER BY r.created_at DESC
                `
            );

        const mapped =
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
                username:r.username
            }));

        return json(res,200,{

            pending:
                mapped.filter(
                    r => r.status === "pending"
                ),

            all:mapped

        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:"Server error."
        });

    }

};
