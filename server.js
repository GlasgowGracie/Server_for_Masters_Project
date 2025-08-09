
var express = require("express");
var app = express();

app.get("/", (req, res) => {
  //  res.send("Hello world");
    var dummyData = {
        "userID": "user1",
        "username": "user1"
    };
    res.json(dummyData);
});
app.listen(8000);