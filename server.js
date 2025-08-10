
var express = require("express");
var fs = require('fs')
var bodyparser = require('body-parser');
var app = express();
const port = 8000;
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
var file = fs.readFileSync("dummyUsers.json"); //get the data from the database into the server
var data = JSON.parse(file);//holds all of the data in the file

app.get("/", (req, res) => {
  //  res.send("Hello world");
    var dummyUserData = {
        "userID": "user1",
        "username": "user1",
        "lives": 2,
        "score": 150,
    };
    res.json(dummyUserData);
});
app.listen(port);


app.post('/login', (req,res)=>
{
console.log("attempting login");
  const { username, password } = req.body;
  let success = false;
  data.users.forEach(user => {
    if(user.username === username && user.password === password)
    {
      success = true;
      // res.send('success');
      res.json({ status: "success", username: user.username, gameInProgress:user.gameInProgress,
        scene:user.scene, musicOn:user.musicOn, volume: user.volume, lives:user.lives, score:user.score
       });
    }
  }) 
  
  if(!success) res.json({ status: "fail" });//res.send('fail');

})