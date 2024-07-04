const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require("multer");




const auth =  (req, res, next) => {
    // get token from header request
    const token = req.header("x-auth-token");

    if(!token){
        return res.status(401).json({msg : "Token is not available, authorization denied."})
    };

    try{
        jwt.verify(token, config.get("jwtSecret"), (error, decoded) => {
            if(error){
                return res.status(401).json({msg: "Token is not valid , unauthorized."})
            }
            else{
                req.user = decoded.userPayload ;


                

                next();

            }
        })

    }catch(err){
        console.error(err.message)
        res.json({msg:err.message})
    }


};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images")  // all the images that client will send will store in => public/images
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}`)
    }
});

const upload = multer({storage}).single("");

module.exports = { auth, upload };