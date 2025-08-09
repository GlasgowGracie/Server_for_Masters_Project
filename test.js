console.log("Hello world");

var http = require("http");

var server = http.createServer( foo )

function foo(req, res){
    res.statusCode = 200;
    res.setHeader("content-Type", "text/plain");
    res.end("Hello web browser!");
}

server.listen(8000);
