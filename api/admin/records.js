const {
    pool,
    json
} = require("./_lib");

module.exports = async function handler(req,res){

    if(req.method !== "GET")
        return json(res,405,{
            error:"Method not allowed"
        });

    try{

        const members =
            await pool.query(
                `
                SELECT COUNT(*)::int AS count
                FROM users
                WHERE is_admin=FALSE
                `
            );

        const records =
            await pool.query(
                `
                SELECT
                    r.id,
                    r.name,
                    r.nick,
                    r.level,
                    r.progress,
                    r.video_name,
                    r.video_url,
                    r.created_at
                FROM records r
                WHERE r.status='approved'
                ORDER BY r.progress DESC,
                         r.created_at DESC
                `
            );

        return json(res,200,{

            members:
                members.rows[0].count,

            records:
                records.rows.map(r => ({
                    id:r.id,
                    name:r.name,
                    nick:r.nick,
                    level:r.level,
                    progress:r.progress,
                    videoName:r.video_name,
                    videoUrl:r.video_url,
                    createdAt:r.created_at
                }))

        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:"Server error."
        });

    }

};
