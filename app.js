//create the Express app
const express = require("express");
const app = express();

//adding Sqlite3 to server
const bodyPaser =require("body-parser");
const sqlite3 =require("sqlite3").verbose();
const path = require("path");

//instruction with the view engine to be used
app.set("view engine", "ejs");
//listen for incoming requests
app.listen(3000);
//middleware to allow access to static files
app.use(express.static("public"));


// Connecting Sqlite database 
const databasePath = path.join(__dirname, 'database','app.db');
//checking and sending message if connected or error to terminal
const dataBase = new sqlite3.Database(databasePath,(err)=>{
    if(err){
        console.error("ERROR on database connection", err.message);
    }else{
        console.log("RUNNING database connection");
    }
});



//route and response
app.get("/", (request, response) => {
    response.render("index", { title: "Home" });
});
// blog page
app.get("/blog", (request, response) => {
    response.render("blog", { title: "blog" })
});
//redirect
app.get("/blogs", (request, response) => {
    response.redirect("/blog");
});

// contact page
app.get("/contact", (request, response) => {
    response.render("contact", { title: "contact" })
});
//redirect
app.get("/contactme", (request, response) => {
    response.redirect("/contact");
});
//404 page
app.use((request, response) => {
    response.status(404).render("404", { title: "404" });

});
