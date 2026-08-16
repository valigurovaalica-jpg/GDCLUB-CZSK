const {
    supabase,
    BUCKET,
    getUser,
    json
} = require("../_lib");

const MAX_SIZE =
    1024 * 1024 * 1024;

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
                error:"Admin účet nemôže posielať rekordy."
            });

        const {
            fileName,
            fileType,
            fileSize
        } = req.body || {};

        const size =
            Number(fileSize);

        if(!fileName || !fileType)
            return json(res,400,{
                error:"Chýbajú údaje o videu."
            });

        if(!fileType.startsWith("video/"))
            return json(res,400,{
                error:"Súbor musí byť video."
            });

        if(!Number.isFinite(size) || size <= 0)
            return json(res,400,{
                error:"Neplatná veľkosť súboru."
            });

        if(size > MAX_SIZE)
            return json(res,413,{
                error:"Video môže mať maximálne 1 GB."
            });

        const safeName =
            String(fileName)
                .replace(/[^a-zA-Z0-9._-]/g,"_")
                .slice(0,120);

        const path =
            `records/${user.id}/${Date.now()}-${safeName}`;

        const {
            data,
            error
        } =
            await supabase
                .storage
                .from(BUCKET)
                .createSignedUploadUrl(
                    path,
                    {
                        upsert:false
                    }
                );

        if(error){

            console.error(error);

            return json(res,500,{
                error:
                    "Nepodarilo sa vytvoriť upload URL: " +
                    error.message
            });

        }

        const videoUrl =
            `${process.env.SUPABASE_URL}` +
            `/storage/v1/object/public/` +
            `${BUCKET}/${path}`;

        return json(res,200,{

            uploadUrl:data.signedUrl,

            path,

            videoUrl,

            maxSize:MAX_SIZE

        });

    }catch(error){

        console.error(error);

        return json(res,500,{
            error:
                "Server error pri vytváraní upload URL."
        });

    }

};
