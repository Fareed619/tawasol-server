const express = require("express");
const router = express.Router();

router.get("/router", (req, res)=> {
    res.send("posts routes")
})


module.exports = router;