const express = require("express")
const router = express.Router()

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);


const redirectLogin = (req, res, next) => {
  if (!req.session.userId ) {
    // redirect to the login page
    console.log("user does not have userId in session")
    console.log("Session:", req.session)
    res.redirect('../users/loggedin')
  } else {
      console.log("user has userId in session")
      next (); // move to the next middleware function
  }
}

router.get('/import_source', function(req,res,next) {
  newsapi.v2.sources({
    language: req.query.language,
  }).then(response => {
    console.log(response)
    response.sources.forEach(function(source) {
      let sqlquery = `
        INSERT INTO source (name)
        VALUES (?)
    `;
     let newrecord = [source.id]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
    })
  })
      res.send(response)
  })
});


router.get('/search',function(req, res, next) {
  let sourceQuery = "SELECT source.id as id, source.name as name FROM source inner join news on news.source_id = source.id group by source.id, source.name"
  db.query(sourceQuery, (err, result) => {
      if (err) {
          next(err)
      }
      res.render("search.ejs", {sources:result})
  });
})

router.get('/search_result', redirectLogin, function (req, res, next) {
  // TODO: valdidation
  let conditions = []
  let params = []
  let message = req.query.message

  if (typeof req.query.author !== 'undefined') {
    conditions.push("author LIKE ?");
    params.push("%" + req.query.author + "%");
  }

  if (typeof req.query.source !== 'undefined' && req.query.source !== '') {
    conditions.push("source_id = ?");
    params.push(req.query.source);
  }

  if (typeof req.query.title !== 'undefined') {
    conditions.push("title LIKE ?");
    params.push("%" + req.query.title + "%");
  }

  if (typeof req.query.description !== 'undefined') {
    conditions.push("description LIKE ?");
    params.push("%" + req.query.description + "%");
  }

  if (typeof req.query.publishedAt !== 'undefined') {
    let date = new Date();
    if (req.query.publishedAt == "today") {
      date.setDate(date.getDate() - 1)
    } else if (req.query.publishedAt == "week") {
      date.setDate(date.getDate() - 7)
    } else if (req.query.publishedAt == "month") {
      date.setDate(date.getDate() - 30)
    }
    conditions.push("published_at >= ?");
    params.push(date);
  }

  let whereQueries = conditions.length ? conditions.join(' AND ') : '1'
    // Search the database
  let sqlquery = "SELECT * FROM news WHERE " + whereQueries + "LIMIT 30"// query database to get all the books
  // execute sql query
  db.query(sqlquery, params, (err, result) => {
      if (err) {
          next(err)
      }
      res.render("news_list.ejs", {newsList:result,message:message})
   })
})

router.get('/my_news/:id', redirectLogin, function(req, res, next) {
    const userId = req.params.id
    if (userId != req.session.userId) {
          return res.status(401).send("The operation is unauthorized")
    }
    let sqlquery = "SELECT news.*, comments.content as comment FROM news inner join comments on comments.news_id = news.id where comments.user_id = ? ORDER BY comments.updated_at DESC LIMIT 30"
    // execute sql query
    db.query(sqlquery, [userId], (err, result) => {
        if (err) {
            next(err)
        }
        res.render("my_news.ejs", {newsList:result})
     })
})

router.get('/list', function(req, res, next) {
    let message = req.query.message
    let sqlquery = "SELECT * FROM news order by created_at desc limit 30" // query database to get all news
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("news_list.ejs", {newsList:result,message:message})
     })
})

router.get('/fetch', function(req, res, next) {
  let sourceQuery = "SELECT id, name FROM source"
  db.query(sourceQuery, (err, result) => {
      if (err) {
          next(err)
      }
      res.render("news_fetch.ejs", {sources:result})
  });
})

router.get('/fetch_news', redirectLogin, function(req, res, next) {
  let keyword = req.query.keyword
  let source = req.query.source.split(":")
  let sourceName = source[0]
  let sourceId = source[1]
  // To query /v2/everything
  // You must include at least one q, source, or domain
  newsapi.v2.everything({
    q: keyword,
    sources: sourceName,
    language: 'en',
    sortBy: 'relevancy',
    pageSize: 10,
  }).then(response => {

    response.articles.forEach(function(article) {
      let sqlquery = `
        INSERT INTO news (author, title, description, url, imageUrl, published_at, content, source_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
     let newrecord = [article.author, article.title, article.description, article.url, article.urlToImage, new Date(article.publishedAt), article.content, sourceId]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
    })
  })
      let message = "Your news is successfully imported!!"
      res.redirect('./list?' + 'source=' + sourceId + '&message=' + message)
  })
})

router.post('/comments', redirectLogin, function(req, res, next) {
  const userId = req.session.userId
  const newsId  = req.body.news_id
  const content = req.body.content
  let sqlquery = "INSERT INTO comments (user_id, news_id, content) VALUES (?, ?, ?)"
    db.query(sqlquery, [userId, newsId, content], (err, result) => {
        if (err) {
            next(err)
        }
    })
    let message = "Your comment is successfully posted!"
    return res.redirect(`./${newsId}?message=${message}`)
})

router.get('/:id', redirectLogin, function(req, res, next) {
  const newsId = req.params.id;
  let message = req.query.message
  let sqlquery = "SELECT * FROM news where id = ?"
  let article = []
  let loginUserComment = false;
  db.query(sqlquery, [newsId], (err, result) => {
      if (err) {
          next(err)
      }
      if (result.length == 0) {
        return res.send('There is no article found   <a href='+'../'+'>Home</a>')
      }
      article = result[0]
  })
  let commentSql = "SELECT comments.id, content, userName, comments.user_id as userId from comments inner join users on users.id = comments.user_id where comments.news_id = ?"
  db.query(commentSql, [newsId], (err, result) => {
      if (err) {
          next(err)
      }
      result.forEach(function(item) {
        if (item.userId == req.session.userId) {
          loginUserComment = true
        }
      });
      res.render("news_show.ejs", { article:article, comments:result, loginUserComment: loginUserComment, userId: req.session.userId, message:message })
  })
})

router.put('/comments', function(req, res, next) {
  const commentId = req.body.id
  const newsId = req.body.news_id
  const sqlquery = "SELECT user_id FROM comments WHERE id = ?";
  const content = req.body.content

  db.query(sqlquery, [commentId], (err, result) => {
      if (err) {
          next(err)
      } else {
        if (result.length == 0) {
          return res.status(500).send("There is no comment found")
        }

        if (result[0].user_id != req.session.userId) {
          return res.status(401).send("The operation is unauthorized")
        }
      }
  })

  const updateQuery = "UPDATE comments SET content = ? WHERE id = ?"
    db.query(updateQuery, [content, commentId], (err, result) => {
      if (err) {
        res.status(500).send("Something happend during the operation")
    } else {
      let message = "Your comment is successfully updated!"
      res.redirect(`./${newsId}?message=${message}`);
    }
  })
})


router.delete('/comments/:id/', function(req, res, next) {
  const commentId = req.params.id
  const newsId = req.body.news_id
  const sqlquery = "SELECT user_id FROM comments WHERE id = ?";

  db.query(sqlquery, [commentId], (err, result) => {
      if (err) {
          next(err)
      } else {
        if (result.length == 0) {
          return res.status(500).send("There is no comment found")
        }
        if (result[0].user_id != req.session.userId) {
          return res.status(401).send("The operation is unauthorized")
        }
      }
  })

  const updateQuery = "DELETE from comments WHERE id = ?"
    db.query(updateQuery, [commentId], (err, result) => {
      if (err) {
      res.status(500).send("Something happend during the operation")
    } else {
      let message = "Your comment is successfully deleted!"
      res.redirect(`../${newsId}?message=${message}`);
    }
  })
})

// Export the router object so index.js can access it
module.exports = router
