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

  if (!errors.isEmpty()) {
    let errorMessage = errors.errors.map(error => error.path).join(',');
    return res.redirect('./register?message=' + errorMessage)
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
          else {
            let message = 'Your account is successfully registered!'
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
  let plainPassword = req.body.password
  let sqlquery = "SELECT id, hashedPassword FROM users where userName =" + '"' + req.body.username + '"'
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
  req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
      let message = 'You are successfully logged out'
      return res.redirect('../?message=' + message)
    })
})

// Export the router object so index.js can access it
module.exports = router
