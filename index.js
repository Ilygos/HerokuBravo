
var mongoDB    = require('mongodb');
var express    = require('express');
var bodyParser = require("body-parser");
var path       = require('path');
var port       = process.env.PORT || 3000;
var app        = express();


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//Unlock this when the Database will operational
var url = "mongodb://Maxence:maxence1@ds125713.mlab.com:25713/tacticalbravo2018";
var MongoClient= mongoDB.MongoClient;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

app.get('/load', function(req, res) {
    console.log("Je fais une requete " + Date.now());
  	res.send("Je viens de l'an : " + (Date.now() * MILLISECONDS_TO_YEAR));
});

app.get("/retrieveLevels", async function(req, res){
    var connection    = await connect();
    var requestResult = await retrieveFromDataBase(connection.db, "Levels");

    connection.db.close();

    console.log(requestResult.result[0]['levels']);
    res.send(requestResult.result[0]['levels']);
});

function retrieveFromDataBase(db, collectionName){
    return new Promise(resolve => {
        db.db("tacticalbravo2018").collection(collectionName).find().toArray(async function(err, result){
            resolve({err:err, result:result});
        });
    })
}

function connect() {
  return new Promise(resolve => {
      mongoDB.connect(url, { useNewUrlParser: true }, function(err, db) {
        resolve({err:err, db:db});
    });
  });
}

app.post('/uplevels', function(req, res) {
    var form = req.body;
    console.log(form['levels']);
    res.send( form['levels']);
    PushDatabase(req.body, "Levels");
});

app.put('/saveData', function(req, res) {
    console.log(req.body);
    var form = req.body;
    PushDatabase(req.body, "Datas");
});

app.listen(port, () => {
  console.log('Server listening at port %d', port);
});

function PushDatabase(obj, collectionName)
{
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("tacticalbravo2018");
  dbo.collection(collectionName).drop();
  dbo.createCollection(collectionName);
  dbo.collection(collectionName).insertOne(obj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
}
