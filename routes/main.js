// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get('/',function(req, res, next){
  let message = req.query.message
  let sqlquery = "SELECT * FROM news order by published_at desc LIMIT 15"
  db.query(sqlquery, (err, result) => {
      if (err) {
          next(err)
      }
      res.render('index.ejs', {userSession:req.session.userId, latestNews:result, message:message})
   })

})

router.get('/about',function(req, res, next){
    res.render('about.ejs')
})

// Export the router object so index.js can access it
module.exports = router
