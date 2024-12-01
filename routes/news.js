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

router.get('/search',function(req, res, next){
    res.render("search.ejs")
})

router.get('/search_result', redirectLogin, function (req, res, next) {
  // TODO: valdidation
  let conditions = []
  let params = []

  if (typeof req.query.author !== 'undefined') {
    conditions.push("author LIKE ?");
    params.push("%" + req.query.author + "%");
  }

  if (typeof req.query.title !== 'undefined') {
    conditions.push("title LIKE ?");
    params.push("%" + req.query.title + "%");
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
  let sqlquery = "SELECT * FROM news WHERE " + whereQueries // query database to get all the books
  // execute sql query
  db.query(sqlquery, params, (err, result) => {
      if (err) {
          next(err)
      }
      res.render("news_list.ejs", {newsList:result})
   })
})

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



router.get('/fetch', function(req, res, next) {
  res.render('news_fetch.ejs')
})

router.get('/fetch_news', redirectLogin, function(req, res, next) {
  let keyword = req.query.keyword
  let source = req.query.source
  // To query /v2/everything
  // You must include at least one q, source, or domain
  newsapi.v2.everything({
    q: keyword,
    sources: source,
    language: 'en',
    sortBy: 'relevancy',
    pageSize: 10,
  }).then(response => {
    // TODO: Add error handling, source column
    response.articles.forEach(function(article) {
      let sqlquery = `
        INSERT INTO news (author, title, description, url, imageUrl, published_at, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
     let newrecord = [article.author, article.title, article.description, article.url, article.urlToImage, new Date(article.publishedAt), article.content]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
    })
  })
      res.send('articles are added to database')
  })
})

// Export the router object so index.js can access it
module.exports = router
