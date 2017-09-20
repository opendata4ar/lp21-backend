const express = require('express')
const app = express()
var format = require('pg-format')

const myport = 8081
const myip   = '0.0.0.0'

const { Client } = require('pg')

const client = new Client({
  host: 'lp21.cyi5isrniwic.eu-west-1.rds.amazonaws.com',
  port: 5432,
  user: 'lp21',
  password: 'Lehrplan21',
  database: 'lp21'
})

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected to DB at ' + client.host)
  }
})

const qCities = {
  // give the query a unique name
  name: 'get-all-cities',
  text: 'SELECT * FROM city WHERE kanton_id = $1',
  //rowMode: 'array',
  values: [21]
}

app.get("/lp21/:id",function(request, response){
  var kanton_id = request.params.id;
  qCities.values = [kanton_id];
  client.query(qCities, (err, res) => {
    if (err) { console.log(err.stack)
    } else { //console.log(res.rows)
      //TODO: transform to <li>? var obj = { id : kanton_id, Content : "lp21  " +id };
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(JSON.stringify(res.rows));  
    }
   })   
});




client.on('notice', (msg) => console.warn('notice:', msg))
client.on('error', (err) => {
  console.error('something bad has happened!', err.stack)
  res.status(500).send('Something bad happened!');
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
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


app.listen(myport, myip);
console.log('Server running on http://%s:%s', myip, myport);

module.exports = app ;
