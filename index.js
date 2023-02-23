import { encryptText, decryptText, getPublicKey } from './encrypt.js';
import express, { json, urlencoded } from 'express';
import http from 'http';
import request from 'express'
import axios from 'axios'
const app = express();
const port = 8001;

app.use(json())
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
  axios.post('http://127.0.0.1:9000/ticket', {
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


