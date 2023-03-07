import { encryptText, decryptText, getPublicKey } from './encrypt.js';
import express, { json, urlencoded } from 'express';
import http from 'http';
import request from 'express'
import axios from 'axios'
import requestIp from 'request-ip'
import e from 'express';
const app = express();
const port = 8001;

app.use(json())
app.set('trust proxy', true)
app.use(urlencoded({ extended: true }))
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})


app.get("/",(request, response) => {
  response.send("authenticate-loadbalancer-server");
});

app.get("/login",(request, response) => {
  response.send(getPublicKey());
});


app.post("/login",(request, response) => {
  const decryptedText = decryptText(request.body.data)
  var loginData = JSON.parse(decryptedText);
  //TODO: data checking here

  var gameServer = getMinLoadServer();
  if(gameServer == null){
    response.send("Service not available",500) 
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'valid_token'
  };
  axios.post(gameServer.ip +'/ticket', {
    username: loginData.username,
  }, { headers })
  .then((serverRespond) => {
    console.log("Receive ticket");
    var ticket = JSON.stringify(serverRespond.data);
    var encrypt = encryptText(ticket,request.body.publickey);
    response.send(encrypt)
  })
  .catch((error) => {
    console.log(error);
    var encrypt = encryptText("False",request.body.publickey);
    response.send(encrypt)
  });
});

app.post('/gameserver', (request, response) => {
  var finalIp = getClientAddress(request);
  if(gameServers[finalIp] == null){
    var gameServer = {
      ip : finalIp,
      numClients: 0,
      numRooms : 0
    }
    gameServers[finalIp] = gameServer;
  }
  gameServers[finalIp].numClients = request.body.numClients;
  gameServers[finalIp].numRooms = request.body.numRooms;
  if(aiServers != null){
    response.send(aiServers,200);
  }
  else{
    response.send("No AI Server",202);
  }
 
});
  
app.post('/aiserver', (request, response) => {
  aiServers = getClientAddress(request);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'valid_token'
  };
  Object.keys(gameServers).forEach(function(key) {
    var gameServer = gameServers[key];
    axios.post(gameServer.ip +'/aiserver', {
      url: aiServers,
    }, { headers })
    .then((serverRespond) => {
      console.log(serverRespond);
    })
    .catch((error) => {
      console.log(error);
    });
  });
  response.send("Oke");
});


var aiServers = null;
var gameServers = {};

function getClientAddress(request) {
  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  var port = request.headers.port;
  var finalIp = "http://" + ip + ":" + port
  return finalIp;
};
function getMinLoadServer(){
  var minServer = null;
  Object.keys(gameServers).forEach(function(key) {
    var gameServer = gameServers[key];
    if(minServer == null){
      minServer = gameServer;
    }
    if(minServer.numClients > gameServer.numClients){
      minServer = gameServer;
    }
  });
  return minServer;
}
