
var fileName = "dummyUsers.json";

var express = require("express");
var fs = require('fs')
var bodyparser = require('body-parser');
var app = express();
const port = 8000;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

var file = fs.readFileSync(fileName); //get the data from the database into the server
var data = JSON.parse(file);//holds all of the data in the file

// app.get("/", (req, res) => {
//   //  res.send("Hello world");
//     var dummyUserData = {
//         "userID": "user1",
//         "username": "user1",
//         "lives": 2,
//         "score": 150,
//     };
//     res.json(dummyUserData);
// });
app.listen(port);

//method to save a game in progress
// app.post('/save', (req, res) =>{
//   console.log("attempting to save");
//   const {username, scene, lives, score} = req.body;//get the data
//   let success = false;
//   let usersData = JSON.parse(fs.readFileSync(fileName));//get current users
//   let users = usersData.users;
//   // let users = usersFile.users;
//   // let users = usersFile;
//   let user = users.find(u => u.username === username);//find the user that wants to save
//   console.log(user.username + user.lives);
//   // if(!user) res.json({ status: "fail" });//if the user cannot be found then send back an error
//      if (!users[username]) res.json({ status: "fail" })
//   else{
//     user.lives = lives;
//     user.score = score;
//     user.scene = scene;
//   console.log(user.username + user.lives);
//     fs.writeFileSync(fileName, JSON.stringify(usersData, null, 2), 'utf8');//write the data back to the file
//     res.json( {status:'success'});
//   }
// })


//debug version 
app.post('/save', (req, res) => {
  console.log("attempting to save");
  console.log("Request body:", req.body); // Debug: see what data we're receiving
  
  const {username, scene, lives, score, musicOn, volume} = req.body; // get the data
  
  try {
    let usersData = JSON.parse(fs.readFileSync(fileName, 'utf8')); // get current users
    console.log("Loaded data:", usersData); // Debug: see what we loaded
    
    let users = usersData.users; // This is an array
    
    // Find the user in the array
    let user = users.find(u => u.username === username);
    console.log("Found user:", user); // Debug: see if we found the user
    
    if (!user) {
      console.log("User not found!");
      res.json({ status: "fail", message: "User not found" });
    } else {
      // Store original values for comparison
      console.log("Before update:", { scene: user.scene, lives: user.lives, score: user.score });
      
      // Update the user's data
      user.scene = scene;         
      user.lives = lives;
      user.score = score;
      user.musicOn = musicOn;
      user.volume = volume;
      
      // console.log("After update:", { scene: user.scene, lives: user.lives, score: user.score });
      // console.log("Writing data back to file...");
      
      // Write the entire structure back to file (not just the users array)
      fs.writeFileSync(fileName, JSON.stringify(usersData, null, 2), 'utf8');
      
      // Verify the write worked by reading it back
      let verification = JSON.parse(fs.readFileSync(fileName, 'utf8'));
      let verifyUser = verification.users.find(u => u.username === username);
      // console.log("Verification - user after write:", verifyUser);
      
      res.json({ status: "success" });
    }
  } catch (error) {
    console.error("Error in save function:", error);
    res.json({ status: "fail", message: "Server error" });
  }
});

app.post('/login', (req,res)=>
{
  console.log("attempting login");
  const { username, password } = req.body;
  let success = false;
  let usersData = JSON.parse(fs.readFileSync(fileName));//get current users
  let users = usersData.users;  
  let user = users.find(u => u.username === username);
  if(!user){
    console.log("user not found");  
    res.json({ status: "fail" });
  } 
  else{
    console.log("user found!");
    if(user.password.toString() === password.toString()){
              res.json({ status: "success", username: user.username, gameInProgress:user.gameInProgress,
          scene:user.scene, musicOn:user.musicOn, volume: user.volume, lives:user.lives, score:user.score
        });
    }
  } 

});

app.post('/signup', (req, res) => 
{
  const { username, password } = req.body;
  let usersData = JSON.parse(fs.readFileSync(fileName));//get current users
  let users = usersData.users;  
  let user = users.find(u => u.username === username);
  if(user){
    console.log("user already has an account"); 
    if(user.password.toString() === password.toString()){
                res.json({ status: "prior_account_found_log_in_success", username: user.username, gameInProgress:user.gameInProgress,
            scene:user.scene, musicOn:user.musicOn, volume: user.volume, lives:user.lives, score:user.score
          });
      }
    else{
        res.json({ status: "fail_username_already_in_use"});
    }
  }
  else{
    const newUser = {
      username: username,
      password: password,
      gameInProgress: false,
      scene: 3,
      lives: 5,
      score: 0,
      musicOn: true,
      volume: 0.5,
      topScore: 0
    };
    users.push(newUser);
    fs.writeFileSync(fileName, JSON.stringify(usersData, null, 2), 'utf8');
        res.json({ status: "success" });
  }


});


