/*-
 * Javascript Sample Application: Connection to Informix with REST
 */

/*-
 * Topics
 * 1 Data Structures
 * 1.1 Create Collection
 * 1.2 Create Table
 * 2 Inserts
 * 2.1 Insert a single document into a collection
 * 2.2 insert multiple documents into a collection
 * 3 Queries
 * 3.1 Find one document in a collection
 * 3.2 Find all documents in a collection
 * 3.3 Count documents in a collection
 * 3.4 Order documents in a collection
 * 3.5 Find distinct fields in a collection
 * 3.6 Joins
 * 3.6a Collection-Collection join
 * 3.6b Table-Collection join
 * 3.6c Table-Table join
 * 3.7 Modifying batch size
 * 3.8 Find with projection clause
 * 4 Update documents in a collection
 * 5 Delete documents in a collection
 * 6 SQL passthrough
 * 7 Transactions
 * 8 Catalog
 * 8.1 Collections + relational tables
 * 8.2 Collections + relational tables + system tables
 * 9 Commands
 * 9.1 collStats
 * 9.2 dbStats
 * 10 List all collections in a database
 * 11 Drop a collection
 */

var express = require('express');
var app = express();
var https = require('http');
var commands = [];
//var myCert = require('fs').readFileSync("");
var host = '';
var port = process.env.VCAP_APP_PORT || 8881;
var database = '/dbTest';
var username = '';
var password = '';

var collection = 'mycollection';
var collectionJoin = 'collectionJoin';
var table = 'mytable';
var tableJoin = 'tableJoin';

//sample data
function City (name, population, longitude, latitude, countryCode) {
	this.name = name;
	this.population = population;
	this.longitude = longitude;
	this.latitude = latitude;
	this.countryCode = countryCode;
}
  
City.prototype.toString = function toString() {
	return "city: " + this.name + "  \tpopulation: " + this.population + "\tlongitude: " + this.longitude + 
	"\tlatitude: " + this.latitude  +  "\tcode: " + this.countryCode;
};

City.prototype.toJSON = function(){
	return "{\"name\":\"" + this.name + "\",\"population\":" + this.population + ",\"longitude\":" + this.longitude + ",\"latitude\":" + this.latitude + ",\"code\":" + this.countryCode + "}";
};

var kansasCity = new City("Kansas City", 467007, 39.0997, 94.5783, 1);
var seattle = new City("Seattle", 652405, 47.6097, 122.3331, 1);
var newYork = new City("New York", 8406000, 40.7127, 74.0059, 1);
var london = new City("London", 8308000, 51.5072, 0.1275, 44);
var tokyo = new City("Tokyo", 13350000, 35.6833, -139.6833, 81);
var madrid = new City("Madrid", 3165000, 40.4001, 3.7167, 34);
var melbourne = new City("Melbourne", 4087000, -37.8136, -144.9631, 61);
var sydney = new City("Sydney", 4293000, -33.8651, -151.2094, 61);

function doEverything(res) {
	parseVcap();
	var options = {
			host : host,
			path : database,
			port : port,
			method : 'POST',
			headers: {
			     'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
			   } 
	};
	
	function createCollection(err) {
		commands.push("1 Data Structures");
		//1 Create a collection
		commands.push("\n1.1 Create a collection");
		
		var request = https.request(options, function(response) {
			if (err){
			return console.error("error: ", err.message);
		}
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tCreate Collection: " + outputString);
				createTable();
			});
		});
		request.write("{'name':" + collection + "}");
		request.end();
	}
	
	function createTable(err) {
		//1 Create a collection
		commands.push("\n1.2 Create a table");
		
		var request = https.request(options, function(response) {
			if (err){
			return console.error("error: ", err.message);
		}
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tCreate Table: " + outputString);
				createDocument();
			});
		});
		request.write("{\"name\":\"" + table + "\"" +
				",\"columns\":[{\"name\":\"name\",\"type\":\"varchar(50)\"}" +
				",{\"name\":\"population\",\"type\":\"int\"}" +
				",{\"name\":\"longitude\",\"type\":\"Deicmal(8,4)\"}" +
				",{\"name\":\"latitude\",\"type\":\"Deicmal(8,4)\"}" +
				",{\"name\":\"code\",\"type\":\"int\"}]}"
);
		request.end();
	}
	
	function createDocument() {
		//2 Inserts
		commands.push("\n2 Inserts");
		//2.1 Insert a single document into a collection
		commands.push("2.1 Insert a single document into a collection");
	
		options.path = database + "/" + collection;
		
		var request = https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tCreate Document: " + outputString);
				createMultipleDocument();
			});
		});
		
	}
	
	function createMultipleDocument() {
		//2.2 Insert multiple documents into a collection
		commands.push("2.2 Insert multiple documents into a collection");
	
		var request = https.request(options,
				function(response) {
					var outputString = '';
					response.on('data', function(chunk) {
						outputString += chunk;
					});
	
					response.on('end', function() {
						commands.push("\tCreate Multiple Documents: "
								+ outputString);
						listDocument();
					});
				});
		request.write("[" + seattle.toJSON() + "," + newYork.toJSON() + "," + london.toJSON() + "," + tokyo.toJSON() + "," + madrid.toJSON() + "," + melbourne.toJSON() +"]");
		request.end();
	}
	
	function listDocument() {
		//Queries
		commands.push("\n3 Queries");
		//3.1 Find documents in a collection that match a query condition
		commands.push("3.1 Find documents in a collection that match a query condition");
	
		options.path = database + "/" + collection + "?query={\"population\":{\"$gt\":8000000},\"code\":1}&fields={_id:0}";
		options.method = 'GET';
	
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tList Document: " + outputString);
				listAllDocuments();
			});
		}).end();
	}
	
	function listAllDocuments() {
		//3.2 Find all documents in a collection
		commands.push("3.2 Find all documents in a collection");
	
		options.path = database + "/" + collection;
		options.method = 'GET';
		
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tList Documents: " + outputString);
				countDocuments();
			});
		}).end();
	}
	
	function countDocuments() {
		//3.3 Count documents in a collection
		commands.push("3.3 Count documents in a collection");
	
		options.path = database + "/$cmd?query={\"count\":" + collection + ",query:{\"longitude\":{\"$lt\":40.0}}}";
		options.method = 'GET';
		
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tNumber of documents: " + outputString);
				sortDocuments();
			});
		}).end();
	}
	
	function sortDocuments() {
		//3.4 Order documents in a collection
		commands.push("3.4 Order documents in a collection");
	
		options.path = database + "/" + collection + "?sort={\"population\":1}";
		options.method = 'GET';
		
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tSorted Documents: " + outputString);
				distinctDocuments();
			});
		}).end();
	}
	
	function distinctDocuments() {
		//3.5 Find distinct fields in a collection
		commands.push("3.5 Find distinct fields in a collection");
	
		options.path = database + "/$cmd?query={\"distinct\":\"" + collection + "\",\"key\":\"code\",\"query\":{\"longitude\":{\"$gt\":40.0}}}";
		options.method = 'GET';
			
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tDistinct Documents: " + outputString);
//				join();
				batchSize();
			});
		}).end();
	}
	
//	function joins() {
//		//3.6 Joins
//		commands.push("3.6 Joins");
//		
//		//create another collection and add data
//		function createCollectionJoin() {
//			options.path = database
//			options.method = 'POST';
//			
//			var request = https.request(options, function(response) {
//				if (err){
//				return console.error("error: ", err.message);
//			}
//				var outputString = '';
//				response.on('data', function(chunk) {
//					outputString += chunk;
//				});
//		
//				response.on('end', function() {
//					commands.push("\tCreate Collection: " + outputString);
//					insertCollectionJoinData();
//				});
//			});
//			request.write("{'name':" + collectionJoin + "}");
//			request.end();
//		}
//		
//		function insertCollectionJoinData() {
//			options.path = database + "/" + collectionJoin;
//			options.method = 'POST';
//			
//			var request = https.request(options,
//					function(response) {
//						var outputString = '';
//						response.on('data', function(chunk) {
//							outputString += chunk;
//						});
//		
//						response.on('end', function() {
//							commands.push("\tCreate Multiple Documents: "
//									+ outputString);
////							listDocument();
//						});
//					});
//			request.write("[{\"countryCode\":1,\"country\":\"United States of America\"}," +
//					"{\"countryCode\":44,\"country\":\"United Kingdom\"}," +
//					"{\"countryCode\":81,\"country\":\"Japan\"}," +
//					"{\"countryCode\":34,\"country\":\"Spain\"}," +
//					"{\"countryCode\":61,\"country\":\"Australia\"}]");
//			request.end();
//		}
//		
//		
//		//create another table and add data
//		function createTableJoin() {
//			options.path = database
//			options.method = 'POST';
//			
//			var request = https.request(options, function(response) {
//				if (err){
//				return console.error("error: ", err.message);
//			}
//				var outputString = '';
//				response.on('data', function(chunk) {
//					outputString += chunk;
//				});
//		
//				response.on('end', function() {
//					commands.push("\tCreate Table: " + outputString);
//					insertTableJoinData();
//				});
//			});
//			request.write("{\"name\":\"" + tableJoin + "\"" +
//					",\"columns\":[{\"name\":\"countryCode\",\"type\":\"int\"}" +
//					",{\"name\":\"country\",\"type\":\"varchar(50)\"}]}"
//	);
//			request.end();
//		}
//		
//		function insertTableJoinData() {
//			options.path = database + "/" + tableJoin;
//			options.method = 'POST';
//			
//			var request = https.request(options,
//					function(response) {
//						var outputString = '';
//						response.on('data', function(chunk) {
//							outputString += chunk;
//						});
//		
//						response.on('end', function() {
//							commands.push("\tCreate Multiple Documents: "
//									+ outputString);
////							listDocument();
//						});
//					});
//			request.write("[{\"countryCode\":1,\"country\":\"United States of America\"}," +
//					"{\"countryCode\":44,\"country\":\"United Kingdom\"}," +
//					"{\"countryCode\":81,\"country\":\"Japan\"}," +
//					"{\"countryCode\":34,\"country\":\"Spain\"}," +
//					"{\"countryCode\":61,\"country\":\"Australia\"}]");
//			request.end();
//		}
//
//		options.path = database + "/" + collection;
//		
//		https.request(options, function(response) {
//			var outputString = '';
//			response.on('data', function(chunk) {
//				outputString += chunk;
//			});
//	
//			response.on('end', function() {
//				commands.push("\tList Documents: " + outputString);
//				batchSize();
//			});
//		}).end();
//	}
	
	function batchSize() {
		//3.7 Modifying batch size
		commands.push("3.7 Modifying batch size");
	
		options.path = database + "/" + collection + "?batchSize=2";
		options.method = 'GET';
			
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("Change batch size");
				commands.push("\tFound Documents: " + outputString);
				projection();
			});
		}).end();
	}
	
	function projection() {
		//3.8 Find with projection clause
		commands.push("3.8 Find with projection clause");
	
		options.path = database + "/" + collection + "?fields={\"name\":1,\"code\":1,\"_id\":0}&query={\"population\":{\"$gt\":8000000}}";
		options.method = 'GET';
			
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tFound Documents: " + outputString);
				updateDocument();
			});
		}).end();
	}
	
	function updateDocument() {
		//4 Update documents in a collection
		commands.push("\n4 Update documents in a collection");
		
		options.path = database + "/mycollection/?query={name:\"Seattle\"}";
		options.method = 'PUT';
		
		var request = https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tUpdate Document: " + outputString);
				deleteDocument();
			});
		});
		request.write("{\"$set\":{code:999}}");
		request.end();
	
	}
	
	function deleteDocument() {
		//5 Delete documents in a collection
		commands.push("\n5 Delete documents in a collection");
		
		options.path = database + "/mycollection?query={name:\"Tokyo\"}";
		options.method = "DELETE";
		
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tDelete Document: " + outputString);
				listAllCollections();
			});
		}).end();
	
	}
	
	
	
	function listAllCollections() {
		//6 List all collections in a database
		commands.push("\n6 List all collections in a database");
	
		options.path = database;
		options.method = 'GET';
	
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tList Collections: " + outputString);
				deleteCollection();
			});
		}).end();
	}
	
	function deleteCollection() {
		//7 Drop a collection
		commands.push("\n7 Drop a collection");
	
		options.path = database + "/mycollection";
		options.method = "DELETE";
	
		https.request(options, function(response) {
			var outputString = '';
			response.on('data', function(chunk) {
				outputString += chunk;
			});
	
			response.on('end', function() {
				commands.push("\tDelete Collection: " + outputString);
				printLog();
				printBrowser();
			});
		}).end();
	
	}
	
	function printLog() {
		for (var i = 0; i < commands.length; i++){
			console.log(commands[i]);
		}
	}
	
	function printBrowser(){
		app.set('view engine', 'ejs');
		res.render('index.ejs', {commands: commands});
	}
	
	//start functions	
	createCollection();
}

function parseVcap(){
//	var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
//	var credentials = vcap_services['altadb-dev'][0].credentials;
//	var ssl = false;
//	database = credentials.db;
//	host = credentials.host;
//	username = credentials.username;
//	password = credentials.password;
//	
//	if (ssl){
//		restport = credentials.ssl_drda_port;
//	}
//	else{
//	    restport = credentials.drda_port;  
//	}
}
//doEverything();

app.get('/databasetest', function(req, res) {
	doEverything(res);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.listen(8882, function(){
	console.log("Running at localhost:8882 ......");
});

