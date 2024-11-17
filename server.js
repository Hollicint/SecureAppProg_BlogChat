const fs = require("fs");
const http = require("http");
const server = http.createServer((request, response) => {
    console.log(request.url, request.method);
     //set the response header
    response.setHeader("Content-Type", "text/html");
     //create the routes
    let path = "./views/";
    switch (request.url) {
       case "/":
            path += "index.html";
            response.statusCode = 200;
            break;
        case "/blog":
            path += "blog.html";
            response.statusCode = 200;
            break;
        case "/blogs":
            response.statusCode = 301;
            response.setHeader("Location", "/blog");
            response.end();
            break;
        case "/contact":
            path += "contact.html";
            response.statusCode = 200;
            break;
        case "/contactme":
            response.statusCode = 301;
            response.setHeader("Location", "/contact");
            response.end();
            break;


        default:
            path += "404.html";
            response.statusCode = 404;
            break;
        }
      
        fs.readFile(path, (error, data) => {
         if (error) {
            console.log(error);
            response.end();
         } else {
         }
            response.end(data);
         
    });
        
});
server.listen(3000, "localhost", () => {
    console.log("Server started. Listening for incoming requests...");

});
