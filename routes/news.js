const express = require("express")
const router = express.Router()

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM news" // query database to get all news
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("news_list.ejs", {newsList:result})
     })
})

// Export the router object so index.js can access it
module.exports = router
