// Create a new router
const express = require("express")
const router = express.Router()
const SHA256 = require("crypto-js/sha256");


router.get('/search', function(req, res, next) {
  let conditions = []
  let params = []
  let userId = req.query.userId
  let apiKey = req.query.apiKey

  if (!isUserValid(userId, apiKey)) {
    return res.json("Invalid user")
  }

  if (typeof req.query.author !== 'undefined' && req.query.author !== '') {
    console.log('here')
    conditions.push("author LIKE ?");
    params.push("%" + req.query.author + "%");
  }

  if (typeof req.query.source !== 'undefined' && req.query.source !== '') {
    conditions.push("source_id = ?");
    params.push(req.query.source);
  }

  if (typeof req.query.title !== 'undefined' && req.query.title !== '') {
    conditions.push("title LIKE ?");
    params.push("%" + req.query.title + "%");
  }

  if (typeof req.query.description !== 'undefined' && req.query.description !== '') {
    conditions.push("description LIKE ?");
    params.push("%" + req.query.description + "%");
  }

  if (typeof req.query.publishedAt !== 'undefined' && req.query.publishedAt !== '') {
    let date = new Date();
    if (req.query.publishedAt == "today") {
      date.setDate(date.getDate() - 1)
    } else if (req.query.publishedAt == "week") {
      date.setDate(date.getDate() - 7)
    } else if (req.query.publishedAt == "month") {
      date.setDate(date.getDate() - 30)
    } else {
      return res.json("Invalid puslishedAt input")
    }
    conditions.push("published_at >= ?");
    params.push(date);
  }

  let whereQueries = conditions.length ? conditions.join(' AND ') : '1=1'
  let sqlquery = "SELECT * FROM news WHERE " + whereQueries + " LIMIT 30"// query database to get all the books
  console.log(`GET /api/search_result is called by userId: ${userId}, query: ${sqlquery}, params: ${params}`)

  db.query(sqlquery, params, (err, result) => {
      if (err) {
          next(err)
          res.json(err)
      }
      res.json(result)
   })
})

// TODO:
// get / post / delete comments
router.post('/comments', function(req, res, next) {
  const newsId  = req.body.news_id
  const content = req.body.content

  let userId = req.query.userId
  let apiKey = req.query.apiKey

  if (!isUserValid(userId, apiKey)) {
    return res.json("Invalid user")
  }

  let sqlquery = "INSERT INTO comments (user_id, news_id, content) VALUES (?, ?, ?)"
    db.query(sqlquery, [userId, newsId, content], (err, result) => {
        if (err) {
            next(err)
            return res.json(err)
        }
    })
    console.log(`New comment is created by userId: ${req.session.userId}, newsId: ${newsId}`)
    let message = "Your comment is successfully posted!"
    return res.json(message)
})

router.get('/my_news', function(req, res, next) {
    let userId = req.query.userId
    let apiKey = req.query.apiKey

    if (!isUserValid(userId, apiKey)) {
      return res.json("Invalid user")
    }

    let sqlquery = "SELECT news.*, comments.content as comment FROM news inner join comments on comments.news_id = news.id where comments.user_id = ? ORDER BY comments.updated_at DESC LIMIT 30"
    // execute sql query
    db.query(sqlquery, [userId], (err, result) => {
        if (err) {
            next(err)
        }
        console.log(`GET /api/my_news is called`)
        res.json({newsList:result})
     })
})


function isUserValid(userId, key) {
  let originalString = userId + process.env.SALT
  const apiKey = SHA256(originalString).toString();
  console.log(apiKey)
  if (apiKey != key) {
    return false
  }
  return true
}

// Export the router object so index.js can access it
module.exports = router
