// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10
const SHA256 = require("crypto-js/sha256");
const sanitizeHtml = require('sanitize-html');

// Validation
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
  if (!req.session.userId ) {
    // redirect to the login page
    res.redirect('./loggedin')
  } else {
      next (); // move to the next middleware function
  }
}

router.get('/register', function (req, res, next) {
    let errorMessage = req.query.message
    res.render('register.ejs', {errorMessage:errorMessage})
})

router.post('/registered', [
  check('email').isEmail(),
  check('username').notEmpty(),
  check('first').notEmpty(),
  check('last').notEmpty(),
  check('password').isLength({ min: 4 }),
], function (req, res, next) {
  const errors = validationResult(req);
  const userName = sanitizeHtml(req.body.username)
  const firstName = sanitizeHtml(req.body.first)
  const lastName = sanitizeHtml(req.body.last)
  const email = sanitizeHtml(req.body.email)
  const password = sanitizeHtml(req.body.password)

  if (!errors.isEmpty()) {
    let errorMessage = errors.errors.map(error => error.path).join(',');
    return res.redirect('./register?message=' + errorMessage)
  }

  const plainPassword = password
  bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    // Store hashed password in your database.
      let sqlquery = "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)"
      let newrecord = [userName, firstName, lastName, email, hashedPassword]
      db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
              next(err)
          }
          else {
            let message = 'Your account is successfully registered!'
            console.log(`New Account is created: ${userName}`)
            return res.redirect('../?message=' + message)
          }
      })
  })
})

router.get('/loggedin', function (req, res, next) {
  let message = req.query.message
  res.render('loggedin.ejs', {message:message})
})

router.post('/loggedin', function (req, res, next) {
  let hashedPassword = ""
  let hashedPlainPassword = ""
  let plainPassword = sanitizeHtml(req.body.password)
  let userName = sanitizeHtml(req.body.username)
  let sqlquery = "SELECT id, hashedPassword FROM users where userName =" + '"' + userName + '"'
  let userId = 0;
  // execute sql query
  db.query(sqlquery, (err, result) => {
      if (err) {
          next(err)
      }
    if (result.length == 0) {
      let errorMessage = 'Check your passowrd and try again'
      return res.redirect('./loggedin?message=' + errorMessage)
    }
    hashedPassword = result[0].hashedPassword
    userId = result[0].id

    bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
      if (err) {
        let errorMessage = 'Check your passowrd and try again'
        return res.redirect('./loggedin?message=' + errorMessage)
      }
      else if (result == true) {
        // Save user session here, when login is successful
        req.session.userId = userId;
        console.log(`${userId} is signed in`)
        let message = 'You are successfully logged in'
        return res.redirect('../?message=' + message)
      }
      else {
        let errorMessage = 'Check your passowrd and try again'
        return res.redirect('./loggedin?message=' + errorMessage)
      }
    })
  })
})

router.get('/logout', redirectLogin, (req,res) => {
  console.log(`${req.session.userId} is signed out`)
  req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
      let message = 'You are successfully logged out'
      return res.redirect('../?message=' + message)
    })
})

router.get('/developer', redirectLogin, (req,res) => {
  let userId = req.session.userId

  let originalString = userId + process.env.SALT
  const apiKey = SHA256(originalString).toString();
  return res.render("developer.ejs", {apiKey: apiKey})
  res.send(`Your API KEY: ${apiKey} <a href="../../">Home</>`)
});

// Export the router object so index.js can access it
module.exports = router
