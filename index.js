var express = require ('express')
var ejs = require('ejs')

//Import mysql module
var mysql = require('mysql2')

const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser
app.use(express.urlencoded({ extended: true }))

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'newshub_app',
    password: 'qwertyuiop',
    database: 'newshub'
})

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))

// Load the route handlers for /books
const newsRoutes = require('./routes/news')
app.use('/news', newsRoutes)
