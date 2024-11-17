const http = require("http");
const server = http.createServer((request, response) => {
    console.log(request.url, request.method);
    //set the response header
    response.setHeader("Content-Type", "text/html");
    //create the content
    response.write("<h1>Hello there!</h1>");
    //end the response
    response.end();



});
server.listen(3000, "localhost", () => {
    console.log("Server started. Listening for incoming requests...");  
});
