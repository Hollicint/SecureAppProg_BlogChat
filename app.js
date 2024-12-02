const express = require("express");


//adding Sqlite3 to server
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

//create the Express app
const app = express();
//instruction with the view engine to be used
app.set("view engine", "ejs");
//listen for incoming requests
app.listen(3000);
//middleware to allow access to static files
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting Sqlite database 
const dbasePath = path.join(__dirname, 'database', 'app.db');
//checking and sending message if connected or error to terminal
const dbase = new sqlite3.Database(dbasePath, (err) => {
    if (err) {
        console.error("ERROR on database connection", err.message);
    } else {
        console.log("RUNNING database connection");
    }
});

//route and response
app.get("/", (request, response) => {
    response.render("index", { title: "Home" });
});



dbase.serialize(() => {
  /*  // Checking and dropping if table exists
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
            response.render("blog", { posts: rows, title: "Blog" });
        }
    });
});
// Adds post to db table for blogs
app.post('/blog', (request, response) => {
    const { title, description, username } = request.body;
    const query = `INSERT INTO blogChat (title, description, username) VALUES ('${title}', '${description}', '${username}')`;
    dbase.run(query, (err) => {
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
    response.render("login", { title: "login" })
});

// Post to manage new reg users going into DB
app.post("/login", (request, response) => {
    const { username, password } = request.body;
  
    //checking if the email or username already exists
    const checkCred = `SELECT * FROM regUser WHERE username = ? OR password = ?`;
    dbase.get(checkCred, [username, password], (err, row) => {
       //if (err) {
       //    console.error("Checking if user already on system ", err.message);
       //    return response.status(500).send("error with server")
       //}
       //if (!row) {
       //    return response.status(404).send("Credentals already on system")
       //}

            if (password== row.password) {
                console.error("User has logged in ");
                response.redirect('/blog');
            } else {
                //once created goes to login page
                return response.status(404).send("not found")
            }
           // response.redirect("/login");
        });
});










//Reg new user 
app.get("/regNewUser", (request, response) => {
    response.render("regNewUser", { title: "Register" })
});

// Post to manage new reg users going into DB
app.post("/regNewUser", (request, response) => {
    const { fName, lName, email, username, password } = request.body;
  
    //checking if the email or username already exists
    const checkCred = `SELECT * FROM regUser WHERE email = ? OR username = ?`;
    dbase.get(checkCred, [email, username], (err, row) => {
        if (err) {
            console.error("Checking if user already on system ", err.message);
            return response.status(500).send("error with server")
        }
        if (row) {
            return response.status(404).send("Credentals already on system")
        }
        //insert new user into database
        const insertQuery = `INSERT INTO regUser(fName, lName, email, username, password) VALUES (?, ?, ?, ?, ?)`;
        dbase.run(insertQuery, [fName, lName, email, username, password], (err) => {
            if (err) {
                console.error(err.message);
                response.status(500).send('Internal Server Error');
            } else {
                //once created goes to login page
                response.redirect('/login');
            }
           // response.redirect("/login");
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