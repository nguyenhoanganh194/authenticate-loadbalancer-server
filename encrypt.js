import crypto from 'crypto'
import fs from 'fs'

const public_key_path = 'public_key.pem';
const private_key_path = 'private_key.pem';
if (fs.existsSync(public_key_path) && fs.existsSync(private_key_path)) {
  var publicKeyRead = fs.readFileSync('public_key.pem', 'utf8');
  var privateKeyRead = fs.readFileSync('private_key.pem', 'utf8')
}
else{
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
  var publicKeyRead = fs.readFileSync('public_key.pem', 'utf8');
  var privateKeyRead = fs.readFileSync('private_key.pem', 'utf8')
}







export function encryptText (plainText) {
  return crypto.publicEncrypt({
    key: publicKeyRead,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  Buffer.from(plainText)
  )
}

export function decryptText (encryptedText) {
  return crypto.privateDecrypt(
    {
      key: privateKeyRead,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedText
  )
}