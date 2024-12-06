// Create a new router
const express = require("express")
const router = express.Router()
const SHA256 = require("crypto-js/sha256");
const apiResponse = { "statusCode": "", "result": []}

router.get('/search', async function(req, res, next) {
  let conditions = []
  let params = []

  // User Check
  const userName = req.query.userName
  const apiKey = req.query.apiKey
  let userQuery = "SELECT * FROM users where userName = ?"
  const [users] = await db.promise().query(userQuery, [userName])
  if (users.length == 0) {
    updateResponse(404, "The user not found")
    return res.json(apiResponse)
  }
  let userId = users[0].id
  if (!isUserValid(userId, apiKey)) {
    updateResponse(401, "unauthorized user")
    return res.json(apiResponse)
  }

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
          updateResponse(500, err)
          res.json(apiResponse)
      }
      updateResponse(200, result)
      return res.json(apiResponse)
   })
})

router.get('/comments', async function(req, res, next) {
  // User Check
  const userName = req.query.userName
  const apiKey = req.query.apiKey
  let userQuery = "SELECT * from users where userName = ?"
  const [users] = await db.promise().query(userQuery, [userName])
  if (users.length == 0) {
    updateResponse(404, "The user not found")
    return res.json(apiResponse)
  }
  let userId = users[0].id
  if (!isUserValid(userId, apiKey)) {
    updateResponse(401, " unauthorized user")
    return res.json(apiResponse)
  }

  let commentQuery = "SELECT * FROM comments where user_id = ?"
  const [comments] = await db.promise().query(commentQuery, [userId])

  updateResponse(200, comments)
  return res.json(apiResponse)
});

router.post('/comments', async function(req, res, next) {
  const newsId  = req.body.news_id
  const content = req.body.content


  // User Check
  const userName = req.query.userName
  const apiKey = req.query.apiKey
  let userQuery = "SELECT * FROM users where userName = ?"
  const [users] = await db.promise().query(userQuery, [userName])
  if (users.length == 0) {
    updateResponse(404, "The user not found")
    return res.json(apiResponse)
  }
  let userId = users[0].id
  if (!isUserValid(userId, apiKey)) {
    updateResponse(401, "unauthorized user")
    return res.json(apiResponse)
  }

  let newsQuery = "SELECT * FROM news where id = ?"
  const [news] = await db.promise().query(newsQuery, [newsId])
  if (news.length == 0) {
    updateResponse(404, "The news does not exist")
    return res.json(apiResponse)
  }

  let commentQuery = "SELECT * FROM comments where user_id = ? and news_id = ?"
  const [comments] = await db.promise().query(commentQuery, [userId, newsId])
  if (comments.length != 0) {
    updateResponse(409, "The comment already exists")
    return res.json(apiResponse)
  }

  let sqlquery = "INSERT INTO comments (user_id, news_id, content) VALUES (?, ?, ?)"
  await db.promise().query(sqlquery, [userId, newsId,content])

  console.log(`New comment is created by userId: ${req.session.userId}, newsId: ${newsId}`)
  updateResponse(201, "Your comment is successfully create!")
  return res.json(apiResponse)
})

router.put('/comments', async function(req, res, next) {
  const newsId = req.body.news_id
  const content = req.body.content

  // User Check
  const userName = req.query.userName
  const apiKey = req.query.apiKey
  let userQuery = "SELECT * from users where userName = ?"
  const [users] = await db.promise().query(userQuery, [userName])

  if (users.length == 0) {
    updateResponse(404, "The user not found")
    return res.json(apiResponse)
  }

  let userId = users[0].id
  if (!isUserValid(userId, apiKey)) {
    updateResponse(401, "unauthorized user")
    return res.json(apiResponse)
  }

  let commentQuery = "SELECT id FROM comments where user_id = ? and news_id = ?"
  const [comments] = await db.promise().query(commentQuery, [userId, newsId])
  if (comments.length == 0) {
    updateResponse(404, "The comment does not exist")
    return res.json(apiResponse)
  }

  const updateQuery = "UPDATE comments SET content = ? WHERE id = ?"
  try {
    await db.promise().query(updateQuery, [content, comments[0].id])
  } catch(err) {
    return res.json(err)
  }
  updateResponse(204, "Your comment is successfully updated!!")
  return res.json(apiResponse)
})

router.delete('/comments', async function(req, res, next) {
  const newsId = req.body.news_id

  // User Check
  const userName = req.query.userName
  const apiKey = req.query.apiKey
  let userQuery = "SELECT * from users where userName = ?"
  const [users] = await db.promise().query(userQuery, [userName])

  if (users.length == 0) {
    updateResponse(404, "The user not found")
    return res.json(apiResponse)
  }

  let userId = users[0].id
  if (!isUserValid(userId, apiKey)) {
    updateResponse(401, "unauthorized user")
    return res.json(apiResponse)
  }

  let commentQuery = "SELECT id FROM comments where user_id = ? and news_id = ?"
  const [comments] = await db.promise().query(commentQuery, [userId, newsId])
  if (comments.length == 0) {
    updateResponse(404, "The comment does not exist")
    return res.json(apiResponse);
  }

  const deleteQuery = "DELETE from comments WHERE id = ?"
  try {
    await db.promise().query(deleteQuery, [comments[0].id])
  } catch(err) {
    return res.json(err)
  }
  updateResponse(204, "Your comment is successfully deleted!!")
  return res.json(apiResponse)
})

router.get('/my_news', async function(req, res, next) {
    try {
      console.log(`GET /api/my_news is called`)

      let userName = req.query.userName
      let apiKey = req.query.apiKey

      let userQuery = "SELECT * from users where userName = ?"
      const [users] = await db.promise().query(userQuery, [userName])
      if (users.length == 0) {
        updateResponse(404, "The user not found")
        return res.json(apiResponse)
      }

      let userId = users[0].id
      if (!isUserValid(userId, apiKey)) {
        updateResponse(401, "unauthorized user")
        return res.json(apiResponse)
      }

      let sqlquery = "SELECT news.*, comments.content as comment FROM news inner join comments on comments.news_id = news.id where comments.user_id = ? ORDER BY comments.updated_at DESC LIMIT 30"
      // execute sql query
      db.query(sqlquery, [userId], (err, result) => {
          if (err) {
              next(err)
          }
          console.log(`GET /api/my_news is called`)
          updateResponse(200, result)
          return res.json(apiResponse)
       })
    } catch (err) {
         console.log(err)
         updateResponse(500, "Something wrong happend")
         return res.json(apiResponse)
      }
})


function isUserValid(userId, key) {
  let originalString = userId + process.env.SALT
  const apiKey = SHA256(originalString).toString();
  if (apiKey != key) {
    return false
  }
  return true
}

function updateResponse(code, response) {
  apiResponse["statusCode"] = code
  apiResponse["result"] = response
}

// Export the router object so index.js can access it
module.exports = router
