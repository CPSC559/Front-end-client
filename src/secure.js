import sodium from 'libsodium-wrappers';
import axios from 'axios';

export async function generateKeyPair() {
  await sodium.ready;
  return sodium.crypto_box_keypair();
}

function generateSymmetricKey() {
  return sodium.crypto_secretbox_keygen();
}

function encryptMessage(message, symmetricKey) {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const { ciphertext, mac } = sodium.crypto_secretbox_detached(
    message,
    nonce,
    symmetricKey
  );

  return { nonce, ciphertext, mac };
}

function encryptSymmetricKey(symmetricKey, publicKey) {
  return sodium.crypto_box_seal(symmetricKey, publicKey);
}

function decryptSymmetricKey(encryptedSymmetricKey, privateKey) {
  return sodium.crypto_box_seal_open(encryptedSymmetricKey, privateKey);
}

function decryptMessage({ nonce, ciphertext, mac }, symmetricKey) {
  return sodium.crypto_secretbox_open_detached(
    ciphertext,
    mac,
    nonce,
    symmetricKey
  );
}

export async function sendEncryptedMessage(message, publicKeys, currChatroom, publicKey) {
  await sodium.ready;
  const symmetricKey = await generateSymmetricKey();
  const encryptedMessage = await encryptMessage(message, symmetricKey);

  let recipients = Array.from(publicKeys).map((publicKey, index) => {
    const publicKeyBase64 = btoa(String.fromCharCode.apply(null, publicKey));

    const encryptedSymmetricKey = encryptSymmetricKey(symmetricKey, publicKey);
    return {
      publicKey: publicKeyBase64,
      encryptedSymmetricKey: encryptedSymmetricKey,
    };
  });

  console.log("Sending the following data to the server:");
  console.log({
    recipients,
    encryptedMessage,
    currChatroom,
  });

  //Temporary bypass to get around encryption problems for prototype
  encryptedMessage.ciphertext = message;
  const publicKeyBase64 = btoa(String.fromCharCode.apply(null, publicKey));
  const macBase64 = btoa(String.fromCharCode.apply(null, encryptedMessage.mac));
  const nonceBase64 = btoa(String.fromCharCode.apply(null, encryptedMessage.nonce));
  encryptedMessage.nonce = nonceBase64;
  encryptedMessage.mac = macBase64;

  axios.post('http://localhost:4000/message', { recipients, encryptedMessage, currChatroom, publicKeyBase64 })
    .then(response => console.log("Server response:", response.data))
    .catch(error => console.error("Error sending to server:", error));
}

export async function decryptReceivedMessage(encryptedData, privateKey) {
  await sodium.ready;
  const { nonce, ciphertext, mac, encryptedSymmetricKey } = encryptedData;

  const symmetricKey = decryptSymmetricKey(encryptedSymmetricKey, privateKey);
  const decryptedMessage = decryptMessage(
    { nonce, ciphertext, mac },
    symmetricKey
  );

  return decryptedMessage;
}