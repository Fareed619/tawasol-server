const express = require("express");
const router = express.Router();

router.get("/router", (req, res)=> {
    res.send("profile routes")
})


module.exports = router;