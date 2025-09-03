
let mysql = require('mysql2');
var express = require("express");

var bodyparser = require('body-parser');//parses requests
const bcrypt = require('bcrypt');//used for password hashing
const cors = require("cors");

var app = express();


var databaseName = "babette_database"//name of the database that this server connects to
const port = process.env.PORT || 3000;//PORT used if delpoyed, otherwise use port 3000
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

//settin up the MySQL connection pool
let pool;
if (process.env.DATABASE_URL) {
  pool = mysql.createPool({//if deployed 
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  pool = mysql.createPool({//if not deployed
    host: "localhost",
    user: "root",
    password: "babette",
    database: databaseName
  });
}

function query(sql, params, callback) {//queries are run using the pool
  pool.query(sql, params, callback);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);//start the server
});

app.get('/health', (req, res) =>{
  res.json({status:"server_online", timestamp: new Date().toISOString()})//check that the server is running
})


app.post('/save', (req, res) => {//saves the game progress to the database
  console.log("attempting to save");
  const {username, gameInProgress, scene, lives, score, topScore, musicOn, volume, playSFX, showTips} = req.body; // get the data
  
  findUser(username, function(err, user){//find the user in the database
    if(user === null) {//if the username couldn't be found
      return res.json({status: "fail_user_not_found"});
    }
    else{
      bools = convertBools(gameInProgress, musicOn, playSFX, showTips)//convert the string into 0 or 1
      const volumeValue = parseFloat(volume); // Convert volume to number if it's a string
        
      let sql = "UPDATE user_information SET password = ?, gameinProgress = ?, scene = ?, lives = ?, score = ?, topScore = ?, musicOn = ?, volume = ?, playSFX = ?, showTips = ? WHERE username = ?";
      query(sql, [user.password, bools[0], scene, lives, score, topScore, bools[1], volumeValue, bools[2], bools[3], username], function (err, result) {//send the query to the database
        if (err) {
          return res.json({ status: "fail", message: "error_saving_user_data"});
        }
        if (result.affectedRows > 0) {
          return res.json({ status: "success"});
        }
      });
    }
  });
});


function convertBools(gameInProgress, musicOn, playSFX, showTips){//converts the bool values that are sent from the game into 1 for true or 0 for false
  let gameProgValue;
  if (gameInProgress=== true || gameInProgress === 'true' || gameInProgress === 'True') {
      gameProgValue = 1;
  } else {
      gameProgValue = 0;
  }
  let musicOnValue;
  if (musicOn === true || musicOn === 'true' || musicOn === 'True') {
      musicOnValue = 1;
  } else {
      musicOnValue = 0;
  }
  let playSFXValue;
  if (playSFX === true || playSFX === 'true' || playSFX === 'True') {
      playSFXValue = 1;
  } else {
      playSFXValue = 0;
  }
  let showTipsValue;
  if (showTips === true || showTips === 'true' || showTips === 'True') {
      showTipsValue = 1;
  } else {
      showTipsValue = 0;
  }
  return [gameProgValue, musicOnValue, playSFXValue, showTipsValue]
}



app.post('/savepreferences', (req, res)=>
{//saves user preferences
  console.log("attempting to save music preferences");
  const {username, musicOn, volume, playSFX, showTips} = req.body; // get the data
  findUser(username, function(err, user){//find the user
      if(user === null) 
      {//if the username couldn't be found
        console.log("fail_user_not_found");
        return res.json({status: "fail_user_not_found"});
      }
      else
      {//convert strings for booleans into numbers
        let musicOnValue;
        if (musicOn === true || musicOn === 'true' || musicOn === 'True') {
            musicOnValue = 1;
        } else {
            musicOnValue = 0;
        }
        let playSFXValue;
        if (playSFX === true || playSFX === 'true' || playSFX === 'True') {
            playSFXValue = 1;
        } else {
            playSFXValue = 0;
        }
        let showTipsValue;
        if (showTips === true || showTips === 'true' || showTips === 'True') {
            showTipsValue = 1;
        } else {
            showTipsValue = 0;
        }
        // Convert volume to number if it's a string
        const volumeValue = parseFloat(volume);
         let sql = "UPDATE user_information SET password = ?, gameinProgress = ?, scene = ?, lives = ?, score = ?, topScore = ?, musicOn = ?, volume = ?, playSFX = ?, showTips = ? WHERE username = ?";
        query(sql, [user.password, user.gameInProgress, user.scene, user.lives, user.score, user.topScore, musicOnValue, volumeValue, playSFXValue, showTipsValue, username], function (err, result) {
          if (err) {
            console.log("SQL Error details:", err); // This will show the actual error
            console.log("SQL Query:", sql);
            console.log("Parameters:", [musicOn, volume, playSFXValue, showTipsValue, username]);
            console.log("user preferences failed to save");
            return res.json({ status: "fail", message: "error_saving_music_preferences"});
          }
          if (result.affectedRows > 0) {
            console.log("user music preferences updated successfully");
            return res.json({ status: "success"});
          }
        });
      }
    });
});

app.get('/topscores', (req, res) => {//returns the top scores from the database
  console.log("attempting to get top scores");
  let sql = "SELECT username, topScore FROM user_information WHERE topScore > 0 ORDER BY topScore DESC LIMIT 5";//gets the top 5 results
  query(sql, function(err, result){
    if(err){
      console.log("Database error:", err);
      return res.json({ status: "fail" });
    }
    else if(result.length > 0){
      console.log("Users found, top user: ", result[0].username);
      res.json(result);// top scores found
    }
    else{
      console.log("Top scores not found");
      res.json([]);
    }
  })
})

app.post('/login', (req,res)=>
{//login a user 
  console.log("attempting login");
  const {username, password } = req.body;
  findUser(username, function(err, user){//find the user 
    if(user === null) {//if the username couldn't be found
      return res.json({status: "fail_username_not_found"});
    }
    else{
      //username found, check password matched
      const storedPass = user.password;//get the users password to check against
      bcrypt.compare(password, storedPass, function(err, isMatch) {
        if (err) {
          //error checking passwords
          return res.json({ status: "fail_error_checking_password"});
        }
        if (isMatch) {// Login successful
          console.log("Password correct! top score = ", user.topScore);
          return res.json({ status: "success", username: user.username, gameInProgress:user.gameInProgress, topScore: user.topScore, musicOn:user.musicOn, volume: user.volume, playSFX: user.playSFX, showTips: user.showTips   });
        } else {
          console.log("Password incorrect!");
          return res.json({ status: "fail_password_not_correct"});
        }
      });
    }
  });
});

app.post('/resumegame', (req,res)=>
{//get details of previous game so that it can be resumed 
  console.log("attempting to resume game");
  const {username} = req.body;
  findUser(username, function(err, user){//find the user 
    if(user === null) {//if the username couldn't be found
      console.log("user not found");
      return res.json({status: "fail_user_not_found"});
    }
    else{//if the user has been found
      console.log("game resume successful ", {scene:user.scene, lives:user.lives, score: user.score});
      return res.json({ status: "success", scene:user.scene, lives: user.lives, score: user.score});//return the game in progress info
    }
  });
});

function findUser(usernameCheck, callback){//find the user in the database by the username
      let sql = "SELECT * FROM user_information WHERE username = ?";
      query(sql, [usernameCheck], function (err, result) {
        if (err) 
        {
          console.log("Database error:", err);
          return callback(err, null);
        }
        if (result.length > 0) {
            console.log("User found:", result[0].username);
            callback(null, result[0]); // User found
        } else {
            console.log("User not found");
            callback(null, null); // User not found return null
        }
      });
}

async function createUser(username, password) 
{//creates a new account in the database and hashes the password
  const password_hashed = await bcrypt.hash(password, 10);
    let sql = "INSERT INTO user_information (username, password, gameInProgress, scene, lives, score, topScore, musicOn, volume, playSFX, showTips) VALUES ?";
    let user = [
        [username, password_hashed, 0, 4, 5, 0, 0, 1, 0.5, 1, 1]//also inserts default data for the other attributes due to railway's database not setting them to default values
    ];
      pool.query(sql, [user], function (err, result) {
        if (err) {
          console.log("error saving password");          
          throw err;
        }
      });
}

app.post('/signup', (req, res) => 
{//creates a new account 
  const { username, password } = req.body;
  findUser(username, function(err, user){//find if there is already a user with the username in the database
    if(user === null) {//if the username is not in use
      createUser(username, password);//create a new user with their chosen username and password
      res.json({ status: "success" });//send a message back to the front end to say that it was successful
    }
    else{
      //username already in use
      res.json({ status: "fail_username_already_in_use"});//send a message back to the front end that the username is already in use
    }

  })

});

//old code from when writing to a JSON file

//old sign in code:
  // let usersData = JSON.parse(fs.readFileSync(fileName));//get current users
  // let users = usersData.users;  
  // let user = users.find(u => u.username === username);


  // if(user){
  //   console.log("user already has an account"); 
  //   if(user.password.toString() === password.toString()){
  //               res.json({ status: "prior_account_found_log_in_success", username: user.username, gameInProgress:user.gameInProgress,
  //           scene:user.scene, musicOn:user.musicOn, volume: user.volume, lives:user.lives, score:user.score
  //         });
  //     }
  //   else{
  //       
  //   }
  // }
  // else{
  //   // const newUser = {
  //   //   username: username,
  //   //   password: password,
  //   //   gameInProgress: false,
  //   //   scene: 3,
  //   //   lives: 5,
  //   //   score: 0,
  //   //   musicOn: true,
  //   //   volume: 0.5,
  //   //   topScore: 0
  //   // };
  //   // users.push(newUser);
  //   // fs.writeFileSync(fileName, JSON.stringify(usersData, null, 2), 'utf8');

  //     createUser(username, password);
     
  // }


// });
//old save code
// try {
  //   let usersData = JSON.parse(fs.readFileSync(fileName, 'utf8')); // get current users
  //   console.log("Loaded data:", usersData); // Debug: see what we loaded
    
  //   let users = usersData.users; // This is an array
    
  //   // Find the user in the array
  //   let user = users.find(u => u.username === username);
  //   console.log("Found user:", user); // Debug: see if we found the user
    
  //   if (!user) {
  //     console.log("User not found!");
  //     res.json({ status: "fail", message: "User not found" });
  //   } else {
  //     // Store original values for comparison
  //     console.log("Before update:", { scene: user.scene, lives: user.lives, score: user.score });
      
  //     // Update the user's data
  //     user.scene = scene;         
  //     user.lives = lives;
  //     user.score = score;
  //     user.musicOn = musicOn;
  //     user.volume = volume;
      
  //     // console.log("After update:", { scene: user.scene, lives: user.lives, score: user.score });
  //     // console.log("Writing data back to file...");
      
  //     // Write the entire structure back to file (not just the users array)
  //     fs.writeFileSync(fileName, JSON.stringify(usersData, null, 2), 'utf8');
      
  //     // Verify the write worked by reading it back
  //     let verification = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  //     let verifyUser = verification.users.find(u => u.username === username);
  //     // console.log("Verification - user after write:", verifyUser);
      
  //     res.json({ status: "success" });
  //   }
  // } catch (error) {
  //   console.error("Error in save function:", error);
  //   res.json({ status: "fail", message: "Server error" });
  // }

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


//old login code
  // // let usersData = JSON.parse(fs.readFileSync(fileName));//get current users
  // // let users = usersData.users;  
  // // let user = users.find(u => u.username === username);
  // if(!user){
  //   console.log("user not found");  

  // } 
  // else{
  //   console.log("user found!");
  //   if(user.password.toString() === password.toString()){
  //             res.json({ status: "success", username: user.username, gameInProgress:user.gameInProgress,
  //         scene:user.scene, musicOn:user.musicOn, volume: user.volume, lives:user.lives, score:user.score
  //       });
  //   }
  // } 
// var file = fs.readFileSync(fileName); //get the data from the database into the server
// var data = JSON.parse(file);//holds all of the data in the file
// // var fileName = "dummyUsers.json";
// // var fs = require('fs')