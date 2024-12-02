// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10


// Sanitisation
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
  if (!req.session.userId ) {
    // redirect to the login page
    console.log("user does not have userId in session")
    console.log("Session:", req.session)
    res.redirect('./loggedin')
  } else {
      console.log("user has userId in session")
      next (); // move to the next middleware function
  }
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', [
  check('email').isEmail(),
  check('username').notEmpty(),
  check('first').notEmpty(),
  check('last').notEmpty(),
  check('password').isLength({ min: 4 }),
], function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors)
    return res.redirect('./register'); 
  }

  const plainPassword = req.body.password
  bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    // Store hashed password in your database.
      let sqlquery = "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)"
      let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword]
      db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
              next(err)
          }
          else
            res.send('You account is succesfully registered! <a href='+'../'+'>Home</a>')
      })
  })
})

router.get('/loggedin', function (req, res, next) {
    res.render('loggedin.ejs')
})

router.post('/loggedin', function (req, res, next) {
  let hashedPassword = ""
  let hashedPlainPassword = ""
  let plainPassword = req.body.password
  let sqlquery = "SELECT id, hashedPassword FROM users where userName =" + '"' + req.body.username + '"'
  let userId = 0;
  // execute sql query
  db.query(sqlquery, (err, result) => {
      if (err) {
          next(err)
      }
    if (result.length == 0) {
      return res.send('Check your passowrd and try again <a href='+'./loggedin'+'>Login</a> <a href='+'../'+'>Home</a>')
    }
    hashedPassword = result[0].hashedPassword
    userId = result[0].id

    bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
      if (err) {
        console.log(err)
        return res.send('Check youuserId passowrd and try again <a href='+'./loggedin'+'>Login</a> <a href='+'../'+'>Home</a>')
      }
      else if (result == true) {
        // Save user session here, when login is successful
        req.session.userId = userId;
        res.send('You succesfully loged in! <a href='+'../'+'>Home</a>')
      }
      else {
        res.send('Check your passowrd and try again <a href='+'./loggedin'+'>Login</a> <a href='+'../'+'>Home</a>')
      }
    })
  })
})

router.get('/logout', redirectLogin, (req,res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'../'+'>Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router
