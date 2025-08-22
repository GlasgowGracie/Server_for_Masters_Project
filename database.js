let mysql = require('mysql2');

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "babette",
  database: "babette_database"
});
// con.query("DROP DATABASE IF EXISTS babette_database", function (err, result) {
//   if (err) throw err;
//   console.log("Database dropped");
  
//   con.query("CREATE DATABASE babette_database", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });
con.query("CREATE DATABASE IF NOT EXISTS babette_database", function (err, result) {
  if (err) throw err;
  console.log("Database created");
  
  con.query("USE babette_database", function (err, result) {
    if (err) throw err;
    console.log("Now using babette_database");
  });
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  let sql = "CREATE TABLE IF NOT EXISTS user_information (username VARCHAR(50) PRIMARY KEY, password VARCHAR(250) NOT NULL, gameInProgress BOOLEAN DEFAULT FALSE NOT NULL, scene INT DEFAULT NULL,lives INT DEFAULT NULL,score INT DEFAULT NULL,topScore INT DEFAULT NULL, musicOn BOOLEAN DEFAULT TRUE, volume FLOAT DEFAULT 0.5, playSFX BOOLEAN DEFAULT TRUE, showTips BOOLEAN DEFAULT TRUE)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});


