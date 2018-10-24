
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

app.post('/retrievePlayerData', async function(req, res){
  var connection    = await connect();
  var requestResult = await retrieveFromDataBase(connection.db, "Datas", req.body['playerID']);
  console.log(req.body['playerID']);
  connection.db.close();
  var response;
  if (requestResult.length)
  {
  response = requestResult.result[0]['playerID'] + "."
   + requestResult.result[0]['softcurrency'] + "."
   + requestResult.result[0]['hardcurrency']+ "."
   + requestResult.result[0]['xpearned']+ "."
   + requestResult.result[0]['energy'];
  }
  else {
    response = ""
  }
  console.log(response);
  res.send(response);

});

app.get("/retrieveLevels", async function(req, res){
    var connection    = await connect();
    var requestResult = await retrieveFromDataBase(connection.db, "Levels");

    connection.db.close();
    res.send(requestResult.result[0]['levels']);
});

function retrieveFromDataBase(db, collectionName){
    return new Promise(resolve => {
        db.db("tacticalbravo2018").collection(collectionName).find().toArray(async function(err, result){
            resolve({err:err, result:result});
        });
    })
}


function retrievePlayerData(db, collectionName, playerID)
{
    return new Promise(
      resole => {
        db.db('tacticalbravo2018').collection(collectionName).find({'playerID':playerID}).toArray(async function(err, result){
          resolve({err:err, result:result});
        })
      }
    )
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

app.post('/upPlayerData', function(req, res) {
    console.log(req.body);
    var form = req.body;
    var obj = {playerID: form['playerID'], softcurrency: form['softcurrency'], hardcurrency: form['hardcurrency'], xpearned: form['xpearned'], energy: form['energy']};
    PushDatas(obj, "Datas");
    res.send("Hello c'est push !");
});

app.listen(port, () => {
  console.log('Server listening at port %d', port);
});

function PushDatas(obj, collectionName)
{
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("tacticalbravo2018");
  dbo.createCollection(collectionName);
  dbo.collection(collectionName).insertOne(obj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
}

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
