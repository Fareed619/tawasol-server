const express = require("express");
const router = express.Router();
const { auth } = require("../utiltis");
const { check, validationResult } = require("express-validator")
const User = require("../models/User");
const Post = require("../models/PostM");



router.post("/",
            auth,
            check("text", "Text is required").notEmpty(),
            async (req, res)=> {
                const  errors = validationResult(req);
                if(!errors.isEmpty()){
                    return res.status(400).json({errors: errors.array()});
                };

                // console.log("req.user ",req.user)
                // console.log("req.body ",req.body)

                try{
                    const userModel = await User.findById(req.user.id).select("-password");
                    // console.log("usermodel:", userModel)
                    const newPost = new Post({
                        text: req.body.text,
                        name: userModel.name,
                        user: req.user.id,

                    });
                    // console.log("newpost instance", newPost)
                    const post = await newPost.save();
                    res.json(post)

                }catch(err){
                    console.log(err.message)
                    return res.status(500).send(err.message)
                }

});

// get posts

router.get("/", auth, async(req, res) => {

    try{
        const allPosts = await Post.find().sort({ date: -1 });
        // console.log(allPosts)
        return res.json(allPosts)

    }catch(err){
        console.log(err.message)
        return res.status(500).send("Server Error")
    }

    
});

// get a specific post
router.get("/:post_id", auth, async(req, res)=> {
    try{
        const postId = req.params.post_id;

        
        const specificPost = await Post.findById(postId);

        if(!specificPost){
            return res.status(404).json({msg: "Post Not Found"})
        }
        // console.log(req.params)

        return res.json(specificPost)
        
    }catch(err){
        console.log(err.message)
        return res.status(500).send("server error" + err.message)
    }



});

// add like to post 

router.put("/like/:id", auth, async(req, res) => {

    try{
        const ID = req.params.id ;
        console.log("ID", ID)
        const postModel = await Post.findById(ID);
        if(postModel.likes.some(like => like.user.toString() === req.user.id)){
            return res.status(400).json({msg: "Post already liked"})

        }

       console.log("PostModel befor" ,postModel.likes)

        postModel.likes.unshift({user: req.user.id});
        

       console.log("PostModel after" ,postModel.likes)


        await postModel.save();
        return res.json(postModel.likes)
    }catch(err){
        console.log(err.message)
        return res.status(500).send(err.message)
    }
});

// unlike 
router.put("/unlike/:id", auth, async(req, res) => {
    try{
        const ID = req.params.id;
        const postModel = await Post.findById(ID);

        if(!postModel.likes.some(like => like.user.toString() === req.user.id)){
            return res.status(400).json({msg: "user has not liked the post previoulsy!"})

        };
 
    //    console.log("PostModel befor" ,postModel.likes)

        postModel.likes = postModel.likes.filter(like => like.user.toString() !== req.user.id);

    //    console.log("PostModel after" ,postModel.likes)

        await postModel.save();
        return res.json(postModel.likes)

    }catch(err){
        console.log(err.message)
        return res.status(500).send(err.message)
    }
});

// add comment to post 

router.post("/comment/:id",
            auth,
            check("text", "Text field is required").notEmpty(),
            async(req, res) => {
                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    return res.status(400).json({errors: errors.array()})

                };
                try{
                    const ID = req.params.id;
                    const { text } = req.body ;
                    const userModel = await User.findById(req.user.id).select("-password");
                    const postModel = await Post.findById(ID);
                    // console.log("userModel", userModel)
                    // console.log("postModel brfore", postModel)
                    const newComment = {
                        text,
                        name: userModel.name ,
                        user: req.user.id,
                    };
    
                    postModel.comments.unshift(newComment);
    
                    // console.log("postModel after", postModel)
    
                    await postModel.save();
                    return res.json(postModel.comments)
    

                }catch(err){
                    console.log(err.message)
                    return res.status(500).send(err.message)

                }
               
            }
        
);


// delete comment

router.delete("/comment/:id/:comment_id", auth, async(req, res) => {
    
    try{
        const userId = req.params.id ;
        const commentId = req.params.comment_id ;
        const postModel = await Post.findById(userId);

        // console.log("postModel before ", postModel)
        const comment = postModel.comments.find(comment => comment.id === commentId);
        // console.log("comment", comment)
        if(!comment) return res.status(404).json({msg: "comment does not exist"}) ;

        if(comment.user.toString() !== req.user.id) return res.status(401).json({msg: "User is not authorized"});
            // console.log("comment.user => ", comment.user)
            // console.log("comment.user.toString() => ", comment.user.toString())

        postModel.comments = postModel.comments.filter(comment => comment.id !== commentId);

        console.log("postModel after", postModel)
        await postModel.save();
        return res.json(postModel.comments)



    }catch(err){
        console.log(err.message)
        return res.status(500).send(err.message)
    }
});

// delete a specific post

router.delete("/:id", auth, async (req, res) => {

    try{
        const postId = req.params.id;

        const postModel = await Post.findById(postId);

        if(!postModel) return res.status(404).json({msg: "Post not found"});

        if(postModel.user.toString() !== req.user.id) return res.status(401).json({msg: "User  not authorized to remove this post"});

        await postModel.deleteOne();
        res.json({msg: "Post is removed"})



    }catch(err){
        console.log(err.message)
        return res.status(500).send(err.message)
    }



})



module.exports = router;