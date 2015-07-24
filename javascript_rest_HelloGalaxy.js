/*-
 * Javascript Sample Application: Connection to Informix with REST
 */

/*-
 * Topics
 * 1 Data Structures
 * 1.1 Create Collection
 * 1.2 Create Table
 * 2 Inserts
 * 2.1 Insert a single document
 * 2.2 insert multiple documents
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

//external dependencies
var express = require('express');
var app = express();
var request = require('request');

//connection information
var host = '';
var port = process.env.VCAP_APP_PORT || 8881;
var database = '';
var username = '';
var password = '';
//if pasting url info use this format
//var url = "https://" + username + ":" + password + "@" + host + ":" + port + database;
var url = '';

//program variables
var collection = 'mycollection';
var collectionToJoin = 'collectionJoin';
var table = 'mytable';
var tableToJoin = 'tableJoin';
var data = "";
var queries = [];
var commands = [];

//format for queries
function Query (queryType, queryValue) {
	this.queryType = queryType;
	this.queryValue = queryValue;
}

//format for sample data
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
	return JSON.parse("{\"name\":\"" + this.name + "\",\"population\":" + this.population + ",\"longitude\":" + this.longitude + ",\"latitude\":" + this.latitude + ",\"code\":" + this.countryCode + "}");
};

//add sample data
var kansasCity = new City("Kansas City", 467007, 39.0997, 94.5783, 1);
var seattle = new City("Seattle", 652405, 47.6097, 122.3331, 1);
var newYork = new City("New York", 8406000, 40.7127, 74.0059, 1);
var london = new City("London", 8308000, 51.5072, 0.1275, 44);
var tokyo = new City("Tokyo", 13350000, 35.6833, -139.6833, 81);
var madrid = new City("Madrid", 3165000, 40.4001, 3.7167, 34);
var melbourne = new City("Melbourne", 4087000, -37.8136, -144.9631, 61);
var sydney = new City("Sydney", 4293000, -33.8651, -151.2094, 61);

function doEverything(res) {
	//if connecting to database via bluemix use the parseVcap function
	parseVcap();
	
	//start chain of function calls
	createCollection();
	
	function createCollection(err) {
		commands.push("1 Data Structures");
		
		//1 Create a collection
		commands.push("1.1 Create a collection");
		
		data = {"name":collection};
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database;
		request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
					commands.push("   -  Create collection: " +  body);
					createTable();
			});
		
	}
	
	function createTable(err) {
		
		//1 Create a collection
		commands.push("1.2 Create a table");
		
		data = {"name":table,"columns":[
	                {"name":"name","type":"varchar(50)"},
	                {"name":"population","type":"int"},
	                {"name":"longitude","type":"Decimal(8,4)"},
	                {"name":"latitude","type":"Decimal(8,4)"},
	                {"name":"code","type":"int"}]};
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database;
		request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
					commands.push("   -  Create table: " +  body);
					createDocument();
			});
		
	}
	
	function createDocument() {
		
		//2 Inserts
		commands.push("\n2 Inserts");
		
		//2.1 Insert a single document
		commands.push("2.1 Insert a single document");
		
		data = kansasCity.toJSON();
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collection;
		request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
					commands.push("   -  Create document: " +  body);
					createDocumentTable();
			});
		
		function createDocumentTable(){
			url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + table;
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Create document: " +  body);
						createMultipleDocument();
				});
		}
		
	}
	
	function createMultipleDocument() {
		
		//2.2 Insert multiple documents
		commands.push("2.2 Insert multiple documents");
		
		data = [seattle.toJSON(),newYork.toJSON(),london.toJSON(),tokyo.toJSON(),madrid.toJSON(),melbourne.toJSON()];
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collection;
		request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
					commands.push("   -  Create multiple documents: " +  body);
					createMultipleTable();
			});
		
		function createMultipleTable(){
			url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + table;
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Create multiple documents: " +  body);
						listDocument();
				});
		}
		
	}
	
	function listDocument() {
		
		//Queries
		commands.push("\n3 Queries");
		
		//3.1 Find documents in a collection that match a query condition
		commands.push("3.1 Find documents in a collection that match a query condition");
		
		queries.length = 0;
		var queryValue = {"population":{"$gt":8000000},"code":1};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		queryValue = {_id:0};
		queries.push(new Query("fields", JSON.stringify(queryValue)));
		urlBasicCreator();
		request.get(url, function(error, response, body){
					commands.push("   -  List documents: " +  body);
					listAllDocuments();
			});
		
	}
	
	function listAllDocuments() {
		
		//3.2 Find all documents in a collection
		commands.push("3.2 Find all documents in a collection");
		
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collection;			
		request.get(url, function(error, response, body){
					commands.push("   -  List documents: " +  body);
					countDocuments();
			});
		
	}
	
	function countDocuments() {
		
		//3.3 Count documents in a collection
		commands.push("3.3 Count documents in a collection");
	
		queries.length = 0;
		var queryValue = {"count":collection,"query":{"longitude":{"$lt":40.0}}};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		urlCommandCreator();
		request.get(url, function(error, response, body){
					commands.push("   -  Count documents: " +  body);
					sortDocuments();
			});
		
	}
	
	function sortDocuments() {
		
		//3.4 Order documents in a collection
		commands.push("3.4 Order documents in a collection");
		
		queries.length = 0;
		var queryValue = {"population":1};
		queries.push(new Query("sort", JSON.stringify(queryValue)));
		urlBasicCreator();
		request.get(url, function(error, response, body){
					commands.push("   -  Sorted documents: " +  body);
					distinctDocuments();
			});
		
	}
	
	function distinctDocuments() {
		
		//3.5 Find distinct fields in a collection
		commands.push("3.5 Find distinct fields in a collection");
		
		queries.length = 0;
		var queryValue = {"distinct":collection,"key":"code","query":{"longitude":{"$gt":40.0}}};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		urlCommandCreator();
		request.get(url, function(error, response, body){
					commands.push("   -  Distinct documents: " +  body);
					joins();
			});
		
	}
	
	function joins() {
		
		//3.6 Joins
		commands.push("3.6 Joins");
		
		//create another collection and add data
		createcollectionToJoin();
		
		function createcollectionToJoin() {
			
			data = {"name":collectionToJoin};
			url = "https://" + username + ":" + password + "@" + host + ":" + port + database;
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Create collection: " +  body);
						insertcollectionToJoinData();
				});
			
		}
		
		function insertcollectionToJoinData() {
			
			data = [{"countryCode":1,"country":"United States of America"},
			        {"countryCode":44,"country":"United Kingdom"},
			        {"countryCode":81,"country":"Japan"},
			        {"countryCode":34,"country":"Spain"},
			        {"countryCode":61,"country":"Australia"}];
			url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collectionToJoin;
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Create multiple documents: " +  body);
						createtableToJoin();
				});
			
		}
		
		//create another table and add data
		function createtableToJoin() {
			
			data = {"name":tableToJoin,"columns":[{"name":"countryCode","type":"int"},{"name":"country","type":"varchar(50)"}]};
    		url = "https://" + username + ":" + password + "@" + host + ":" + port + database;
    		request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
    					commands.push("   -  Create table: " +  body);
    					inserttableToJoinData();
    			});
			
		}
		
		function inserttableToJoinData() {
			
			data = [{"countryCode":1,"country":"United States of America"},
			        {"countryCode":44,"country":"United Kingdom"},
			        {"countryCode":81,"country":"Japan"},
			        {"countryCode":34,"country":"Spain"},
			        {"countryCode":61,"country":"Australia"}];
			url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + tableToJoin;
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Create multiple documents: " +  body);
						joinCollectionWithCollection();
				});
			
		}
		
		function joinCollectionWithCollection(){
			
			queries.length = 0;
			
			//create the json
			var conditionClause = {};
			conditionClause[collection+".code"] = collectionToJoin+".countryCode";
			var dataAboutCollectionToJoin = {"$project":{"countryCode":1,"country":1}};
			var dataAboutCollection = {"$project":{"name":1,"population":1,"longitude":1,"latitude":1}};
			var collectionsClause = {};
			collectionsClause[collection] = dataAboutCollection;
			collectionsClause[collectionToJoin] = dataAboutCollectionToJoin;
			var jsonObject = {"$collections":collectionsClause,"$condition":conditionClause};
			
			var queryValue = jsonObject;
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlJoinCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Collection - Collection Join: " +  body);
						joinCollectionWithTable();
				});
			
			}
		
		function joinCollectionWithTable(){
			
			queries.length = 0;
			
			//create the json
			var conditionClause = {};
			conditionClause[table+".code"] = collectionToJoin+".countryCode";
			var dataAboutCollectionToJoin = {"$project":{"countryCode":1,"country":1}};
			var dataAboutTable = {"$project":{"name":1,"population":1,"longitude":1,"latitude":1}};
			var collectionsClause = {};
			collectionsClause[table] = dataAboutTable;
			collectionsClause[collectionToJoin] = dataAboutCollectionToJoin;
			var jsonObject = {"$collections":collectionsClause,"$condition":conditionClause};
			
			var queryValue = jsonObject;
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlJoinCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Collection - Table Join: " +  body);
						joinTableWithTable();
				});
			
			}
		
		function joinTableWithTable(){
			
			queries.length = 0;

			var conditionClause = {};
			conditionClause[table+".code"] = tableToJoin+".countryCode";
			var dataAboutTableToJoin = {"$project":{"countryCode":1,"country":1}};
			var dataAboutTable = {"$project":{"name":1,"population":1,"longitude":1,"latitude":1}};
			var collectionsClause = {};
			collectionsClause[table] = dataAboutTable;
			collectionsClause[tableToJoin] = dataAboutTableToJoin;
			var jsonObject = {"$collections":collectionsClause,"$condition":conditionClause};
			
			var queryValue = jsonObject;
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlJoinCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Table - Table Join: " +  body);
						batchSize();
				});
			
			}
	}
		
	function batchSize() {
		
		//3.7 Modifying batch size
		commands.push("3.7 Modifying batch size");
		
		queries.length = 0;
		var queryValue = 2;
		queries.push(new Query("batchSize", queryValue));
		urlBasicCreator();
		request.get(url, function(error, response, body){
					commands.push("   -  Batch documents: " +  body);
					projection();
			});
		
	}
	
	function projection() {
		
		//3.8 Find with projection clause
		commands.push("3.8 Find with projection clause");

		queries.length = 0;
		var queryValue = {"name":1,"code":1,"_id":0};
		queries.push(new Query("fields", JSON.stringify(queryValue)));
		queryValue = {"population":{"$gt":8000000}};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		urlBasicCreator();
		request.get(url, function(error, response, body){
					commands.push("   -  Projection documents: " +  body);
					updateDocument();
			});
		
	}
	
	function updateDocument() {
		//4 Update documents in a collection
		commands.push("\n4 Update documents in a collection");
		
		queries.length = 0;
		var queryValue = {"name":"Seattle"};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		urlBasicCreator();
		data = {"$set":{"code":999}};
		request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
					commands.push("   -  Update document: " +  body);
					deleteDocument();
			});
		
	}
	
	function deleteDocument() {
		//5 Delete documents in a collection
		commands.push("\n5 Delete documents in a collection");
		
		queries.length = 0;
		var queryValue = {"name":"Tokyo"};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		urlBasicCreator();
		request.del(url, function(error, response, body){
					commands.push("   -  Delete document: " +  body);
					sqlPassthrough();
			});
		
	}
	
	function sqlPassthrough() {
		
		//6 SQL passthrough
		commands.push("\n6 SQL passthrough");
		
		sqlCreateTable();
		function sqlCreateTable() {
			
		queries.length = 0;
		var queryValue = {"$sql":"create table if not exists town (name varchar(255), countryCode int)"};
		queries.push(new Query("query", JSON.stringify(queryValue)));
		urlSQLCreator();
		request.get(url, function(error, response, body) {
				commands.push("   -  SQL Create: " + body);
				sqlInsertDocument();
			});
		
		}
		
		function sqlInsertDocument() {
			
			queries.length = 0;
			var queryValue = {"$sql":"insert into town values ('Manhattan', 1)"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlSQLCreator();
			request.get(url, function(error, response, body) {
					commands.push("   -  SQL Insert: " + body);
					sqlListAll();
			});
			
		}
		
		function sqlListAll() {
			
			queries.length = 0;
			var queryValue = {"$sql":"select * from town"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlSQLCreator();
			request.get(url, function(error, response, body) {
					commands.push("   -  SQL Select: " + body);
					sqlDropTable();
			});
			
		}
		
		function sqlDropTable() {
			
			queries.length = 0;
			var queryValue = {"$sql":"drop table town"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlSQLCreator();
			request.get(url, function(error, response, body) {
					commands.push("   -  SQL Drop Table: " + body);
					transactions();
			});
			
		}
	}
	
	function transactions() {
		
		//7 Transactions
		commands.push("\n7 Transactions");
		
		enableTransactions();
		
		function enableTransactions() {
			
			queries.length = 0;
			var queryValue = {transaction:"enable"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Transaction Enable: " +  body);
						insertTransaction();
				});
			
		}
		
		function insertTransaction() {
			
			data = sydney.toJSON();
			url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collection;
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Create document: " +  body);
						updateTransaction();
				});
			
		}
		
		function updateTransaction() {
			
			queries.length = 0;
			var queryValue = {"name":"Seattle"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlBasicCreator();
			data = {"$set":{"code":998}};
			request.post({url: url, body: JSON.stringify(data)}, function(error, response, body){
						commands.push("   -  Update document: " +  body);
						commitTransaction();
				});
			
		}
		
		function commitTransaction() {

			queries.length = 0;
			var queryValue = {transaction:"commit"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Transaction commit: " +  body);
						deleteDocumentTransaction();
				});
			
			
		}
		
		function deleteDocumentTransaction() {
			
			queries.length = 0;
			var queryValue = {"name":"Sydney"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlBasicCreator();
			request.del(url, function(error, response, body){
						commands.push("   -  Delete document: " +  body);
						rollbackTransaction();
				});
			
		}
		
		function rollbackTransaction() {

			queries.length = 0;
			var queryValue = {transaction:"rollback"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Transaction Rollback: " +  body);
						statusTransaction();
				});
			
		}
		
		function statusTransaction() {

			queries.length = 0;
			var queryValue = {transaction:"status"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Transaction Status: " +  body);
						endTransaction();
				});
			
		}
		
		function endTransaction() {
			
			queries.length = 0;
			var queryValue = {transaction:"disable"};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Transaction disable: " +  body);
						catalog();
				});
			
		}
	}
	
	
	function catalog() {
		
		//8 Catalog
		commands.push("\n8 Catalog");
		
		includeRelational();
		
		function includeRelational() {
			
			//8.1 Collections + relational tables
			commands.push("\n8.1 Collections + relational tables");
			
			queries.length = 0;
			var queryValue = {includeRelational:true};
			queries.push(new Query("options", JSON.stringify(queryValue)));
			urlCatalogCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Catalog: " +  body);
						includeSystem();
				});
			
		}
		
		function includeSystem() {
			
			//8.2 Collections + relational tables + system tables
			commands.push("\n8.2 Collections + relational tables + system tables");
			
			queries.length = 0;
			var queryValue = {includeRelational:true,includeSystem:true};
			queries.push(new Query("options", JSON.stringify(queryValue)));
			urlCatalogCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  Catalog: " +  body);
						commandStatments();
				});
			
		}
	}
	
	function commandStatments() {
		
		//9 Commands
		commands.push("\n9 Commands");
		
		collStats();
		
		function collStats() {
			
			//9.1 collStats
			commands.push("\n9.1 collStats");
			
			queries.length = 0;
			var queryValue = {collStats:collection};
			queries.push(new Query("query", JSON.stringify(queryValue)));
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  collStats: " +  body);
						dbStats();
				});
		}
		
		function dbStats() {
			
			//9.2 dbStats
			commands.push("\n9.2 dbStats");
			
			queries.length = 0;
			var queryValue = {dbStats:1};
			queries.push(new Query("query", JSON.stringify(queryValue)));	
			urlCommandCreator();
			request.get(url, function(error, response, body){
						commands.push("   -  dbStats: " +  body);
						listAllCollections();
				});
			
		}
	}
	
	function listAllCollections() {
		
		//10 List all collections in a database
		commands.push("\n10 List all collections in a database");
		
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database;
		request.get(url, function(error, response, body){
			commands.push("   -  List all collections: " + body);
			deleteCollection();
		});
		
	}
	
	function deleteCollection() {
		
		//7 Drop a collection
		commands.push("\n11 Drop a collection");
		
		url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collection;
		request.del(url, function(error, response, body){
					commands.push("   -  Delete collection: " +  body);
					//At this point you can call another function
					//For the purpose of this example, we use callbacks to drop the rest of the collections/tables
					url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + table;
					request.del(url, function(error, response, body){
						commands.push("   -  Delete Table: " + body);
						url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + collectionToJoin;
						request.del(url, function(error, response, body){
							commands.push("   -  Delete Collection: " + body);
							url = "https://" + username + ":" + password + "@" + host + ":" + port + database + "/" + tableToJoin;
							request.del(url, function(error, response, body){
								commands.push("   -  Delete Table: " + body);
								printLog();
							});
						});
					});
			});
	}
	
	function printLog() {
		
		//print a log of responses to the console
		for (var i = 0; i < commands.length; i++){
			console.log(commands[i]);
		}
		
		printBrowser();
	}
	
	function printBrowser(){
		
		//print a log of responses to a webpage
		app.set('view engine', 'ejs');
		res.render('index.ejs', {commands: commands});
		
	}
	
}

function parseVcap(){
	
	//set connection options via VCAP_SERVICES
	var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = vcap_services['timeseriesdatabase'][0].credentials;
	var ssl = false;
	database = credentials.db;
	host = credentials.host;
	username = credentials.username;
	password = credentials.password;
	if (ssl) {	
		url = credentials.ssl_rest_url;
		port = credentials.ssl_rest_port;
	} else {
		url = credentials.rest_url;
		port = credentials.rest_port;  
	}
	
}

function urlCommandCreator() {
	
	for (var i = 0, len = queries.length; i < len;  i++) {
		if (i != 0)
			url = url + "&" + queries[i].queryType + "=" + queries[i].queryValue;
		else
			url = url + "/$cmd?" + queries[i].queryType + "=" + queries[i].queryValue;			
	}
}
	
function urlCatalogCreator() {
	
	for (var i = 0, len = queries.length; i < len;  i++) {
		if (i != 0)
			url = url + "&" + queries[i].queryType + "=" + queries[i].queryValue;
		else
			url = url + "?" + queries[i].queryType + "=" + queries[i].queryValue;			
	}
}	

function urlSQLCreator() {
	
	for (var i = 0, len = queries.length; i < len;  i++) {
		if (i != 0)
			url = url + "&" + queries[i].queryType + "=" + queries[i].queryValue;
		else
			url = url + "/system.sql?" + queries[i].queryType + "=" + queries[i].queryValue;			
	}
	
}

function urlJoinCreator() {
	
	for (var i = 0, len = queries.length; i < len;  i++) {
		if (i != 0)
			url = url + "&" + queries[i].queryType + "=" + queries[i].queryValue;
		else
			url = url + "/system.join?" + queries[i].queryType + "=" + queries[i].queryValue;			
	}
	
}

function urlBasicCreator() {
	
	for (var i = 0, len = queries.length; i < len;  i++) {
		if (i != 0)
			url = url + "&" + queries[i].queryType + "=" + queries[i].queryValue;
		else
			url = url + "/" + collection + "?" + queries[i].queryType + "=" + queries[i].queryValue;			
	}
	
}

app.get('/databasetest', function(req, res) {
	console.log("\nRunning database test ......");
	doEverything(res);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
	console.log("\nDisplaying homepage ......");
});

app.listen(process.env.VCAP_APP_PORT, process.env.VCAP_APP_HOST, function(){
	console.log("Running ......");
});

