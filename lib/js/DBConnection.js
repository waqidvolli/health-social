var mysql      = require('mysql');

var DBConnection = function(){

	return mysql.createConnection({
	  host     : '127.0.0.1',
	  port: '3307',
	  user     : 'root',
	  password : '',
	  database : 'health_social'
	});

}


module.exports = DBConnection;