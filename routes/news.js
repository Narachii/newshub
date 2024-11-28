const express = require("express")
const router = express.Router()

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

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

router.get('/fetch_news', function(req, res, next) {
  console.log(req.query)
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
    // TODO: Add error handling
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
