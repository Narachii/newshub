// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs', {userSession:req.session.userId})
})

// Export the router object so index.js can access it
module.exports = router
