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

        if(!user || !user.admin)
            return json(res,403,{
                error:"Nemáš oprávnenie."
            });

        const {
            id,
            status
        } = req.body || {};

        const recordId =
            Number(id);

        if(
            !Number.isInteger(recordId)
        ){

            return json(res,400,{
                error:"Neplatné ID."
            });

        }

        if(
            status !== "approved" &&
            status !== "rejected"
        ){

            return json(res,400,{
                error:"Neplatný status."
            });

        }

        const result =
            await pool.query(
                `
                UPDATE records
                SET
                    status=$1,
                    reviewed_at=NOW(),
                    reviewed_by=$2
                WHERE id=$3
                  AND status='pending'
                RETURNING id,status
                `,
                [
                    status,
                    user.id,
                    recordId
                ]
            );

        if(!result.rows.length)
            return json(res,404,{
                error:
                    "Rekord neexistuje alebo už bol vybavený."
            });

        return json(res,200,{
            success:true,
            record:result.rows[0]
        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:
                "Server error pri moderovaní."
        });

    }

};
