import crypto from 'crypto'
import fs from 'fs'
import pki from 'node-forge'

const public_key_path = 'public_key.pem';
const private_key_path = 'private_key.pem';

var publicKeyRead = null;
var privateKeyRead = null;
export function updateKey(){
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
  fs.writeFileSync("public_key.pem", publicKey);
  fs.writeFileSync("private_key.pem", privateKey);
  publicKeyRead = fs.readFileSync('public_key.pem', 'utf8');
  privateKeyRead = fs.readFileSync('private_key.pem', 'utf8')
}

export function encryptText (plainText, publicKey) {
  var encs = crypto.publicEncrypt(publicKey, Buffer.from(plainText));
  var encs = encs.toString("base64");
  return encs;
}

export function decryptText (encryptedText) {
  var dcs = crypto.privateDecrypt(privateKeyRead, Buffer.from(encryptedText, "base64"));
  var dcs = dcs.toString("utf8");
  return dcs;
}
export function getPublicKey(){
  return publicKeyRead;
}