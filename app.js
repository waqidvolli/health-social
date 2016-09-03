var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var DBConnection = require("./lib/js/DBConnection");
var fs = require("fs");
var app = express();

var current_week = 1;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
	// console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});

app.use(express.static("./public"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/toastr', express.static(__dirname + '/node_modules/toastr/build/'));
app.use('/lib', express.static(__dirname + '/lib/'));
app.use(cors());



app.get("/api/group/:id", function(req, res) {

    
    var connection = DBConnection();
    connection.connect();

    connection.query('SELECT * FROM health_social.group WHERE id ='+req.params.id, function(err, rows, fields) {
      if (!err)
        res.json(rows);
      else
        console.log(err);
    });

    connection.end();


});


app.get("/api/search/:name", function(req, res) {

    
    var connection = DBConnection();

    connection.connect();

    connection.query('SELECT id,name FROM health_social.group WHERE name like "%'+req.params.name+'%"', function(err, rows, fields) {
      if (!err)
        res.json(rows);
      else
        console.log(err);
    });

    connection.end();


});

app.get("/api/usergroups/:user", function(req, res) {

    
    var connection = DBConnection();

    connection.connect();

    var query = `SELECT * FROM health_social.group , health_social.user_group 
                  WHERE id = group_id and user_id = ${req.params.user}`;

    connection.query(query, function(err, rows, fields) {
      if (!err)
        res.json(rows);
      else
        console.log(err);
    });

    connection.end();


});



// Get details of all user goals belonging to specific group for a specific week
app.get("/api/groups/:group", function(req, res) {
    
    var connection = DBConnection();

    connection.connect();
    
    var query = `SELECT goal.id, goal.activity, goal.week_id, goal.user_id, user.name, goal.target, goal.completed
              FROM user_group 
              INNER JOIN goal
                  on goal.user_id = user_group.user_id 
              INNER JOIN user
                  on goal.user_id = user.id
              WHERE user_group.group_id= ${req.params.group}  AND goal.week_id= ${current_week}`
    
    connection.query(query, function(err, rows, fields) {
      if (!err)
        res.json(rows);
      else
        console.log(err);
    });

    connection.end();

});


// Get details of user goals for the specific week
app.get("/api/goals/:user", function(req, res) {
    
    var connection = DBConnection();

    connection.connect();

    connection.query(`SELECT * FROM health_social.goal WHERE user_id=${req.params.user} and week_id=${current_week}`, function(err, rows, fields) {
      if (!err)
        res.json(rows);
      else
        console.log(err);
    });

    connection.end();

});


// app.get("/api/groups.html", function(req, res){
//   fs.readFile("./public/group.html", "UTF-8", function(err, html) {
//     res.writeHead(200, {"Content-Type": "text/html"});
//     res.end(html);
//   });
// });
app.post("/api/goals/reset", function(req, res) {

    var connection = DBConnection();

    connection.connect();

    var query = `DELETE FROM health_social.goal WHERE user_id = ${req.body.user} AND week_id=${current_week}`;

    connection.query(query, function(err, rows, fields) {
      if (!err){
          console.log(`Success, Goals for user ${req.body.user} has been reset`);
          res.json('success');
        }else{
          console.log(`Error, Could not reset goals for user ${req.body.user}`);
          res.json('error')
      }
    });
    
    connection.end();

});

app.post("/api/goals/create", function(req, res) {

    var connection = DBConnection();

    connection.connect();

    var query = `INSERT INTO health_social.goal (user_id, week_id, activity, target, completed) 
                  VALUES (${req.body.user}, ${current_week}, "${req.body.activity}", ${req.body.target}, ${req.body.completed})`;

    connection.query(query, function(err, rows, fields) {
      if (!err){
          console.log(`Success, new goal set for user: ${req.body.user} - ${req.body.activity} - ${req.body.target} `);
          res.json('success');
        }else{
          console.log(`Error, could not create goal: ${req.body.user} - ${req.body.activity} -- ${req.body.target} `);
          res.json('error')
      }
    });
    
    connection.end();

});


app.post("/api/groups/create", function(req, res) {

    var connection = DBConnection();

    connection.connect();

    connection.query('INSERT into health_social.group (name,access_key) values ("'+req.body.name+'","'+req.body.key+'")', function(err, rows, fields) {
      if (!err){
          console.log(`Success, new group created: ${req.body.name} `);
          res.json('success');
        }else{
          console.log(`Error, could not create group: ${req.body.name}`);
          res.json('error')
      }
    });
    
    connection.end();

});

// app.delete("/dictionary-api/:term", function(req, res) {
//     skierTerms = skierTerms.filter(function(definition) {
//         return definition.term.toLowerCase() !== req.params.term.toLowerCase();
//     });
//     res.json(skierTerms);
// });

app.listen(3000);

console.log("Express app running on port 3000");

module.exports = app;