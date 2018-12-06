
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
  var requestResult = await retrievePlayerData(connection.db, "Datas", req.body['playerID']);
  connection.db.close();
  var response;
  if (requestResult.result.length <= 0)
  {
    response = "";
  }
  else {
      var json = JSON.stringify({
      playerID: requestResult.result[0]['playerID'],
      softCurrency: parseInt(requestResult.result[0]['softcurrency']),
      hardCurrency: parseInt(requestResult.result[0]['hardcurrency']),
      expPlayer: parseInt(requestResult.result[0]['xpearned']),
      energy: parseInt(requestResult.result[0]['energy'])
    });
    response = json;
  }
  res.send(response);
});

app.get("/retrieveLevels", async function(req, res){
  var connection    = await connect();
  var requestResult = await retrieveFromDataBase(connection.db, "Levels");

  connection.db.close();
  console.log(requestResult.result);
  res.send(requestResult.result['levels']);
});

function retrieveFromDataBase(db, collectionName){
  return new Promise(resolve => {
    db.db("tacticalbravo2018").collection(collectionName).findOne({},(async function(err, result){
      resolve({err:err, result:result});
    }));
  })
}


function retrievePlayerData(db, collectionName, playerIDStr)
{
  return new Promise(
    resolve => {
      var query = {playerID:playerIDStr};
      db.db('tacticalbravo2018').collection(collectionName).find(query).toArray(async function(err, result){
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

app.post('/uplevels', async function(req, res) {
  var form = req.body;
  console.log(form['levels']);
  var connection    = await connect();
  var requestResult = await PushDatabase(connection.db,req.body, "Levels");
  connection.db.close();
  res.send( form['levels']);
});

app.post('/upPlayerData',async function(req, res) {
  var form = req.body;
  var obj = {playerID: form['playerID'], softcurrency: form['softcurrency'], hardcurrency: form['hardcurrency'], xpearned: form['xpearned'], energy: form['energy']};
  var objUpdate = {$set:{playerID: form['playerID'], softcurrency: form['softcurrency'], hardcurrency: form['hardcurrency'], xpearned: form['xpearned'], energy: form['energy']}};
  var connection    = await connect();
  var result = await retrievePlayerData(connection.db, "Datas", form['playerID']);
  connection.db.close;
  if (!result)
  {
    PushDatas(obj, "Datas");
  }
  else {
    UpdateDatas(objUpdate, "Datas", form['playerID'])
  }
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
    dbo.collection(collectionName).insertOne(obj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

function UpdateDatas(obj, collectionName, playerIDStr)
{
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tacticalbravo2018");
    var query = {playerID:playerIDStr};
    dbo.collection(collectionName).update(query, obj, {upsert:true}, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}

function PushDatabase(db, obj, collectionName)
{
    var dbo = db.db("tacticalbravo2018");
    return new Promise(resolve => {
      var myquery = {};
      dbo.collection(collectionName).updateOne(myquery, obj, function(err, result) {
        resolve({err:err, result:result});
      });
    })
}
