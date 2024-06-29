const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");



/*
register api  post request => url = http:localhost:5000/api/users/regiter

*/

router.post("/register", 
    check("name", "Name is required ").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please choose a password with at least 6 characters").isLength({min:6}),


    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body;

       try{

        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({errors: "The User is already exists"})
        }

        user = new User({
            name, 
            email, 
            password
        });

        // bcrypt 
        const salt = await bcrypt.genSalt(10) ;
        user.password = await bcrypt.hash(password, salt)
        await user.save();


        // jwt 

        const payLoad = {
            user: {
                id : user.id 
            }
        };

        jwt.sign(payLoad, config.get("jwtSecret"), {expiresIn:"5 days"}, (err, token)=> {
            if(err){
                throw err
            }
            else{
                res.json({token})
            }
        } )


       }catch(err){
        console.error(err)
        res.status(500).send(err.message)

       }




});


/*
login api post request = >> url = http:localhost:5000/api/users/login
*/

router.post("/login",
            check("email", "Please include a valid Email").isEmail(),
            check("password", "Please choose a password with at least 6 characters").isLength({min:6}),
            async (req, res)=> {
                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    return res.status(400).json({errors:errors.array()});
                }
                 
                const { email, password } = req.body;

                try {
                    let user = await User.findOne({email});
                    if(!user){
                        return res.status(400).json({errors:[{msg: "Invalid credentials email"}]})

                    };

                    const isMatch = await bcrypt.compare(password, user.password);
                    if(!isMatch){
                        return res.status(400).json({errors:[{msg : "Invalid Credentials password"}]})
                    }

                    const payLoad = {
                        user : {
                            id: user.id
                        }
                    };

                    jwt.sign(payLoad, config.get("jwtSecret"),{expiresIn: "5 days"}, (err, token) => {
                        if(err){
                            throw err;
                        }
                        else{
                            res.json({token})

                        }


                })        




                }catch(err){
                    console.error(err.message)
                    res.status(500).send(err.message)

                }

})



module.exports = router;