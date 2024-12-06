var express = require ('express')
var ejs = require('ejs')
var bodyParser = require('body-parser');

// set up environment variables
var dotenv = require('dotenv')
dotenv.config()

//Import mysql module
var mysql = require('mysql2')

//Session
var session = require ('express-session')

//validation
var validator = require ('express-validator');

const app = express()
const port = 8000

// For update/delete method
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up bootstrap css
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(bodyParser.json());
// Set up the body parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }))

// Create a session
app.use(session({
 secret: process.env.SESSION_SECRET,
 resave: false,
 saveUninitialized: false,
 cookie: {
  expires: 600000
 }
}))

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

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /news
const newsRoutes = require('./routes/news')
app.use('/news', newsRoutes)

// Load the route handlers for /api
const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))
