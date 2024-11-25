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

// blog page
//app.get("/blog", (request, response) => {
//    response.render("blog", { title: "blog" })
//});

dbase.serialize(() => {
    dbase.run('DROP TABLE IF EXISTS blog_posts', (err) => {
        if (err) {
            console.error("Error dropping table:", err.message);
        } else {
            console.log("Old blog_posts table dropped (if it existed).");
        }
    });

    dbase.run(`
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            username TEXT NOT NULL,  
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        
    ,)//, (err) => {
    //    if (err) {
    //        console.error("Error creating table:", err.message);
    //    } else {
    //        console.log("Table blog_posts created (or already exists).");
    //    }
    //});
});

app.get("/blog", (request, response) => {
    dbase.all('SELECT * FROM blog_posts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            response.status(500).send('Internal Server Error');
        } else {
            response.render("blog", {posts: rows ,  title: "Blog" });
        }
    });
});

app.post('/blog',(request,response)=>{
    const{title,description,username} = request.body;
    const query = `INSERT INTO blog_posts (title, description, username) VALUES ('${title}', '${description}', '${username}')`;
    dbase.run(query, (err) => {
        if (err) {
            console.error(err.message);
            response.status(500).send('Internal Server Error');
        } else {
            response.redirect('/blog');
        }
    });
});


//redirect
//app.get("/blogs", (request, response) => {
//    response.redirect("/blog");
//});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



//404 page
app.use((request, response) => {
    response.status(404).render("404", { title: "404" });
});