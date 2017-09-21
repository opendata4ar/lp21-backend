const express = require('express')
const app = express()
var format = require('pg-format')
var tools = require('./backend-helper');

const myport = 8081
const myip   = '0.0.0.0'

const { Client } = require('pg');

const client = new Client({
  host: 'lp21.cyi5isrniwic.eu-west-1.rds.amazonaws.com',
  port: 5432,
  user: 'lp21',
  password: 'Lehrplan21',
  database: 'lp21'
})

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack);
  } else {
    console.log('connected to DB at ' + client.host);
  }
})
/**
 * School
 */
const qSchoolsByCity = {
  name: 'get-schools-by-city',
  text: 'SELECT * FROM school WHERE city_id = $1 ORDER BY label',
  values: [404]
}

app.get("/lp21/school/:id",function(httpRequest, httpResponse){
  var start = Date.now();
  var city_id = httpRequest.params.id;
  if (city_id == undefined || city_id < 1 ) {
	var sql = undefined;
  } else {
	qSchoolsByCity.values = [city_id];
	var sql = qSchoolsByCity;
  }
}); 
  
  
/**
 * City
 */
const qCitiesByState = {
  // give the query a *unique* name
  name: 'get-cities-by-state',
  text: 'SELECT * FROM city WHERE kanton_id = $1',
  //rowMode: 'array',
  values: [21]
}

const qCitiesByUser = {
	  name: 'get-cities-by-user', // id isNaN
	  text: "SELECT * FROM city, ... WHERE email = '$1'",
	  //rowMode: 'array',
	  values: ['opendata4ar@gmail.com']
	}

const qCities = {
	  name: 'get-all-cities',
	  text: 'SELECT * FROM city ORDER BY label',
	}

app.get("/lp21/city/:id",function(httpRequest, httpResponse){
  var start = Date.now();
  var kanton_id = httpRequest.params.id;
  if (kanton_id == undefined || kanton_id < 1 ) {
	var sql = qCities;
  } else {
	qCitiesByState.values = [kanton_id];
	var sql = qCitiesByState;
  }
  client.query(sql, (sqlError, sqlResult) => {
    if (sqlError) {
      tools.onError(sqlError, httpRequest, httpResponse);

    } else { //console.log(sqlResult.rows)
      //TODO: transform to <li>? var obj = { id : kanton_id, Content : "lp21  " +id };
      var jsonResult = JSON.stringify(sqlResult.rows);
      httpResponse.header("Access-Control-Allow-Origin", "*");
      
      // Need to set Content-Length explicitly just to avoid Transfer-Encoding: chunked
      //JS string.length does not account for utf-8 encoding
      // see https://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
      // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
      var utf8ExtraLength = encodeURIComponent(jsonResult).match(/%[89ABab]/g);
      var contentLength = jsonResult.length + (utf8ExtraLength ? utf8ExtraLength.length : 0);
      httpResponse.header('Content-Length', contentLength);
      httpResponse.header('Transfer-Encoding', '');
      httpResponse.writeHead(200, {"Content-Type": "application/json"});
      httpResponse.write(jsonResult);
      var end = Date.now();
      console.log("served " + contentLength+" of kanton_id=" + kanton_id + " in " + (end-start) + " ms");
    }
   })   
});



client.on('notice', (msg) => console.warn('notice:', msg))
client.on('error', (error) => {
  tools.onError(error, null);  

})

/*
client.end((err) => {
  console.log('client has disconnected')
  if (err) {
    console.log('error during disconnection', err.stack)
  }
})
*/

// error handling
app.use(function(error, req, res, next){
  tools.onError(error, req, res);  

});


app.listen(myport, myip);
console.log('Server running on http://%s:%s', myip, myport);

module.exports = app ;
