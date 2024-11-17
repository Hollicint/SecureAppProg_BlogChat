const express = require("express");
//create the Express app
const app = express();
 //instruction with the view engine to be used
 app.set("view engine", "ejs");
 //listen for incoming requests
app.listen(3000);

//middleware to allow access to static files
app.use(express.static("public"));


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
    response.render("contact",{ title: "contact" })
});
 //redirect
app.get("/contactme", (request, response) => {
    response.redirect("/contact");
});
 //404 page
app.use((request, response) => {
    response.status(404).render("404",{ title: "404" });

});
   