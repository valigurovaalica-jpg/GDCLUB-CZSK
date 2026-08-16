const {
    getUser,
    json
} = require("./_lib");

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
                error:"Not logged in"
            });

        return json(res,200,{
            user
        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:"Server error."
        });

    }

};
