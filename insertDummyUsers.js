const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const plainPassword = 'password123'; 

// const hashedPassword = await bcrypt.hash(plainPassword, 10);
let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "babette",
  database: "babette_database"
});

async function insertDummyUsers() {
    const hash1 = await bcrypt.hash('password123', 10);
    // con.query("INSERT INTO users (username, password_hashed) VALUES (?, ?)", 
    //   [username, hashedPassword], 
    //   function (err, result) {
    //     if (err) throw err;
    //     console.log("User created!");
    //   });
    con.connect(function(err) {
    if (err) throw err;
    let sql = "INSERT INTO user_information (username, password_hashed) VALUES ?";
    let users = [
        ['user1', hash1],
        ['user2', hash1],
    ];
    con.query(sql, [users], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        con.end();
    });
    });
}
insertDummyUsers();
