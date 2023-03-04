import { encryptText, decryptText, getPublicKey } from './encrypt.js';
import express, { json, urlencoded } from 'express';
import http from 'http';
import request from 'express'
import axios from 'axios'
import requestIp from 'request-ip'
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

app.get("/login",(request, response) => {
  response.send(getPublicKey());
});


app.post("/login",(request, response) => {
  const decryptedText = decryptText(request.body.data)
  var loginData = JSON.parse(decryptedText);
  //TODO: data checking here
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'valid_token'
  };
  var server = gameServers[Object.keys(gameServers)[0]];
  console.log(server);

  axios.post(server.ip +'/ticket', {
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
  if(gameServers[request.ip] == null){
    var gameServer = {
      ip : request.headers.host,
      numClients: 0,
      numRooms : 0
    }
    console.log(request.socket.address());
    gameServers[request.ip] = gameServer;
  }
  gameServers[request.ip].numClients = request.body.numClients;
  gameServers[request.ip].numRooms = request.body.numRooms;
  response.send("Oke");
});
  
app.post('/aiServer', (request, response) => {
  aiServers = request.ip;
  response.send("Oke");
});


const aiServers = null;
const gameServers = {};

function getClientAddress(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0] 
  || req.connection.remoteAddress;
};
