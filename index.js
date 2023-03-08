import { encryptText, decryptText, getPublicKey, updateKey } from './encrypt.js';
import express, { json, urlencoded } from 'express';
import http from 'http';
import request from 'express'
import axios from 'axios'
import requestIp from 'request-ip'
import e from 'express';
const app = express();
const port = 8001;
var aiServers = {};
var gameServers = {};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'valid_token'
};

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

app.get("/ai",(request, response) => {
  response.send(aiServers);
});

app.get("/gameserver",(request, response) => {
  response.send(gameServers);
});

app.get("/login",(request, response) => {
  response.send(getPublicKey());
});




app.post("/login",(request, response) => {
  const decryptedText = decryptText(request.body.data)
  var loginData = JSON.parse(decryptedText);
  //Auto pass login
  var userData ={
    username: loginData.username,
    win : 0,
    lose :0
  }
  getTicketFromGameServer(request,response,userData);
})

app.post("/updateuserdata",(request, response) => {
  var userData = request.body.data;
  response.send("Oke");
})
 

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
  var finalIp = getClientAddress(request);
  if(aiServers[finalIp] == null){
    var server = {
      ip : finalIp,
      numClients: 0,
      numRooms : 0
    }
    aiServers[finalIp] = server;
  }
  response.send("Oke");
});




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

async function getTicketFromGameServer(request,response,userData){
  var gameServer = null;
  var completed = false;
  var success = false;
  while(Object.keys(gameServers).length > 0){
    gameServer = getMinLoadServer();
    axios.post(gameServer.ip +'/ticket', userData, { headers })
    .then((serverRespond) => {
      var ticket = JSON.stringify(serverRespond.data);
      var encrypt = encryptText(ticket,request.body.publickey);
      response.send(encrypt);
      completed = true;
      success= true;
    })
    .catch((error) => {
      console.log(error);
      completed = true;
      success= false;
    });
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if(success){
      return
    }
    else{
      delete gameServers[gameServer.ip];
    }
  }
  var encrypt = encryptText("False",request.body.publickey);
  console.log("False to send request to game server");
  response.send(encrypt)
}

updateNodeEveryInterval()

async function updateNodeEveryInterval(){
  while(true){
    await new Promise(resolve => setTimeout(resolve, 10*1000));
    updateNodeStatus();
  }
}


function updateNodeStatus(){
  Object.keys(aiServers).forEach(function(key) {
    var server = aiServers[key];
    axios.post(server.ip +'/status',{}, { headers })
    .then((serverRespond) => {

    })
    .catch((error) => {
      console.log(error);
      delete aiServers[server.ip];
    });
  });


  Object.keys(gameServers).forEach(function(key) {
    var gameServer = gameServers[key];
    axios.post(gameServer.ip +'/status', JSON.stringify(aiServers), { headers })
    .then((serverRespond) => {
      gameServer.numClients = serverRespond.data.numClients;
      gameServer.numRooms = serverRespond.data.numRooms;
    })
    .catch((error) => {
      console.log(error);
      delete gameServers[gameServer.ip];
    });
  });
  console.log(aiServers);
  console.log(gameServers);
}

updateKeyEveryInterval()


async function updateKeyEveryInterval(){
  while(true){
    //Update every 1h
    updateKey();
    await new Promise(resolve => setTimeout(resolve, 1*3600*1000));
  }
}
