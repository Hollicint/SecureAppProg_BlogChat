//importing frameworks
const express = require("express");
//allowing server parsing
const bodyParser = require("body-parser");
//adding Sqlite3 to server
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
//const { session } = require("inspector");
const { request } = require("http");
const session = require("express-session");
//inserting limit attempts for login
const rateLimit = require('express-rate-limit');
//imports bcrypt for hashing
const bcrypt = require('bcrypt');
const { isMatch } = require("lodash");
const { title } = require("process");
//sets level of hashing
const saltRounds = 12;

//create the Express instance
const app = express();
//instruction with the view engine to be used
app.set("view engine", "ejs");
//listen for incoming requests
app.listen(3000);
//middleware to allow access to static files
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// session Configue -  This is a secret key
//load environment 
require('dotenv').config();

app.use(
    session({
        //secret: "e1hmWcsUC7b6XYa6mzPE4jq2hqlEhLUqdxtj9RU43zc", //session cookies
       // securing the password as its expose if hardcoded moved to its own file .env
        secret: process.env.session_secret,
        resave: false, // prevents uncecessary session saving
        saveUninitialized: false, // no empty sessions
        //securing cookies
        cookie:{
            httpOnly: true, //prevenets XSS using JS in the browser
            secure: process.env.NODE_ENV === 'production', // cookies sent over HTTPS
            sameSite: 'strict', //allows only request and trusted sites cookies
        },
        //resetting session after 1 min if the site isnt touched it will make user sign back in
        rolling: true, // reset
        maxAge: 60000, // 1 min of none active it will reset

    })
);


// Connecting Sqlite database  to app.db file page
const dbasePath = path.join(__dirname, 'database', 'app.db');
//checking and sending message if connected or error to server
const dbase = new sqlite3.Database(dbasePath, (err) => {
    if (err) {
        console.error("ERROR on database connection", err.message);
    } else {
        console.log("RUNNING database connection");
    }
});

//Sets the limit tries to enter login
const limitLogin = rateLimit({
    windowMs: 1 * 60 * 1000, //recover time before attempt again
    max: 3, // min attempts to try
    message:"Your login attempts are up" // error message
});


//Middleware to check Authentication
function isAuthen(request, response, next) {
    if (request.session.user) {
        return next();
    }
    response.redirect("/login");
}


//route and response
app.get("/", (request, response) => {
    response.render("index", { title: "Home" });
});



dbase.serialize(() => {
    /*  // Checking and dropping if table exists and dropping
      dbase.run('DROP TABLE IF EXISTS blogChat', (err) => {
          if (err) {
              console.error("Error dropping table:", err.message);
          } else {
              console.log("Old blogChat table dropped (if it existed).");
          }
      });
      // Checking and dropping if table exists
      dbase.run('DROP TABLE IF EXISTS regUser', (err) => {
          if (err) {
              console.error("Error dropping table:", err.message);
          } else {
              console.log("Old regUser table dropped (if it existed).");
          }
      });
      // Checking and dropping if table exists
      dbase.run('DROP TABLE IF EXISTS userlogin', (err) => {
          if (err) {
              console.error("Error dropping table:", err.message);
          } else {
              console.log("Old userlogin table dropped (if it existed).");
          }
  
      });
  */

    // Creating table for blog
    dbase.run(`
        CREATE TABLE IF NOT EXISTS blogChat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            username TEXT NOT NULL,  
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`

        ,),
        // Creating table for reg new user
        dbase.run(` 
        CREATE TABLE IF NOT EXISTS regUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fName TEXT NOT NULL UNIQUE,
            LName TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`

        )
    // Creating table for user login
    dbase.run(` 
        CREATE TABLE IF NOT EXISTS userlogin(
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             username TEXT NOT NULL UNIQUE,
             password TEXT NOT NULL,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    )

    //, (err) => {
    //    if (err) {
    //        console.error("Error creating table:", err.message);
    //    } else {
    //        console.log("Table blogChat created (or already exists).");
    //    }
    //});
});
// Gets and displays the blog post
app.get("/blog", (request, response) => {
    dbase.all('SELECT * FROM blogChat ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            response.status(500).send('Internal Server Error');
        } else {
            // response.render("blog", { posts: rows, title: "Blog" });
            response.render("blog", {
                 posts: rows,
                  user: request.session.user || null, 
                  title: "Blog" });

        }
    });
});
// Adds post to db table for blogs
app.post('/blog', isAuthen, (request, response) => {
    const { title, description, username } = request.body;
   // const query = `INSERT INTO blogChat (title, description, username) VALUES ('${title}', '${description}', '${username}')`;
    //? helps treat it as data and not SQL executable 
   const query = `INSERT INTO blogChat (title, description, username) VALUES (?,?,?)`;
    //runnign query - securing the input
  // dbase.run(query, (err) => {
    dbase.run(query,[title, description, username], (err) => {
        if (err) {
            console.error(err.message);
            response.status(500).send('Internal Server Error');
        } else {
            response.redirect('/blog');
        }
    });
});

// blog page
//app.get("/blog", (request, response) => {
//    response.render("blog", { title: "blog" })
//});
//redirect
//app.get("/blogs", (request, response) => {
//    response.redirect("/blog");
//});


//Login
app.get("/login", (request, response) => {
    response.render("login", {
         title: "login", 
         user: request.session.user || null,
         errorMessage: null //"Login credentails incorrect"
         
    });
});

// Post to manage new reg users going into DB
// limitLogin makes ure the limit attempts are given to the login page
app.post("/login", limitLogin,(request, response) => {
    const { username, password } = request.body;

    //checking if the email or username already exists
    //const checkCred = `SELECT * FROM regUser WHERE username = ? OR password = ?`;
    //now only checks the hashed password
    const checkCred = `SELECT * FROM regUser WHERE username = ?`;
    //dbase.get(checkCred, [username, password], (err, row) => {
    dbase.get(checkCred, [username], (err, row) => {
        if (err) {
            console.error("Login Error ", err.message);
            return response.render("Login", {
                title: "Login",
                errorMessage: "Error with login details"
            });
        }
        if (!row) {
           // return response.status(404).send("Credentals already on system")
           return response.render("login",{
                title: "Login",
                errorMessage:"Username not found "
           });
        }
        // if (row) {
        //     request.session.user = { username: row.username };
        //     return response.redirect("/blog");
        // }
        // response.status(401).send("Invalid Credentials");//

        // if (password == row.password) {
        //     console.error("User has logged in ");
        //     response.redirect('/blog');
        // } else {
        //     //once created goes to login page
        //     return response.status(404).send("not found")
        // }
        // // response.redirect("/login");

     // Compare the plain password entered by the user with the hashed password stored in the database

        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) {
                console.error("Password incorrect", err.message);
                //return response.status(500).send("Password incorrect");
                return response.render("login",{
                    //reduce data being exposed with more simple terms 
                    title: "Login", 
                    errorMessage: "Error with password, please try again"
                });
            }
            if (isMatch) {
                request.session.user = { username: row.username };
                return response.redirect("/blog");
            } else {
                //return response.status(401).send("Password Invalid");
                return response.render("login",{
                    //reduce data being exposed with more simple terms 
                    title: "Login", 
                    errorMessage: "Error with password,  please try again"
                });

            }
        });
    });
});

app.get("/logout", (request, response) => {
    request.session.destroy(() => {
        response.redirect("/login");
    });
});



//Reg new user 
app.get("/regNewUser", (request, response) => {
    response.render("regNewUser", { title: "Register" })
});

// Post to manage new reg users going into DB
app.post("/regNewUser", (request, response) => {
    const { fName, lName, email, username, password } = request.body;

    // Check Email is entered correctly
    const emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(!emailFormat.test(email)){
       // return response.status(400).send("Incorrect email format");
       return response.render("regNewUser",{
            title: "Register",
            errorMessage: "Incorrect email format"
       });
    }

    //Check Username is enterd correctly
    if(username.length < 6){
        //return response.status(400).send("Incorrect username format");
        return response.render("regNewUser",{
            title: "Register",
            errorMessage: "Incorrect username format"
       });
    }

    //Check password is entered correctly

    if(password.length < 8 || password.length > 14 ){
       // return response.status(400).send("Incorrect password length must be between 8 to 14 ");
        return response.render("regNewUser",{
            title: "Register",
            errorMessage: "Incorrect password length must be between 8 to 14"
       });
    }

    //checking if the email or username already exists
    const checkCred = `SELECT * FROM regUser WHERE email = ? OR username = ?`;
    dbase.get(checkCred, [email, username], (err, row) => {
        if (err) {
            console.error("Error User exists ", err.message);
            return response.status(500).send("Error User details being checked")
        }
        if (row) {
            //return response.status(404).send("Credentals already exists")
            return response.render("regNewUser",{
                title: "Register",
                errorMessage: "Credentals already exists"
           });
        }

        // bcrypt -  the password is being encrypt here to be saved in the DB
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error("Hashing password error", err.message);
                return response.status(500).send("Hashing password error");
            }
            // })

            //insert new user into database
            const insertQuery = `INSERT INTO regUser(fName, lName, email, username, password) VALUES (?, ?, ?, ?, ?)`;
            dbase.run(insertQuery, [fName, lName, email, username, hashedPassword], (err) => {
                if (err) {
                    console.error("Error with New User",err.message);
                    response.status(500).send('Error with Internal Server');
                } else {
                    //once created goes to login page
                    response.redirect('/login');
                }
                // response.redirect("/login");
            });
        });
    });
});




//Forgotten Credentials
app.get("/forgottenpass", (request, response) => {
    response.render("forgottenpass", { title: "Forgot" })
});

//404 page
app.use((request, response) => {
    response.status(404).render("404", { title: "404" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});