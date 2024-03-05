import sodium from "libsodium-wrappers";
import axios from "axios";
import {
  serializeUint8ArrayObject,
  deserializeUint8ArrayObject,
} from "./serializationUtils";

export async function generateKeyPair() {
  await sodium.ready;
  return sodium.crypto_box_keypair();
}

function generateSymmetricKey() {
  return sodium.crypto_secretbox_keygen();
}

function encryptMessage(message, symmetricKey) {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(message, nonce, symmetricKey);

  return { nonce, cipher };
}

function encryptSymmetricKey(symmetricKey, publicKey) {
  return sodium.crypto_box_seal(symmetricKey, publicKey);
}

function decryptSymmetricKey(encryptedSymmetricKey, keyPair) {
  return sodium.crypto_box_seal_open(
    encryptedSymmetricKey,
    keyPair.publicKey,
    keyPair.privateKey
  );
}

function decryptMessage(nonce, cipher, symmetricKey) {
  return sodium.crypto_secretbox_open_easy(cipher, nonce, symmetricKey, "text");
}

export async function sendEncryptedMessage(
  message,
  publicKeys,
  currChatroom,
  senderBase64PublicKey,
  server
) {
  await sodium.ready;
  const symmetricKey = generateSymmetricKey();
  const encryptedMessage = encryptMessage(message, symmetricKey);

  let recipients = {};

  // Sending the encrypted data to each recipient
  publicKeys.forEach((publicKey) => {
    recipients[publicKey] = encryptSymmetricKey(
      symmetricKey,
      sodium.from_base64(publicKey)
    );
  });

  const serializedEncryptedMessage =
    serializeUint8ArrayObject(encryptedMessage);

  const serializedRecipients = serializeUint8ArrayObject(recipients);

  axios
    .post(`${server}/message`, {
      cipher: serializedEncryptedMessage,
      recipients: serializedRecipients,
      currChatroom,
      senderBase64PublicKey,
    })
    .then((response) => console.log("Server response:", response.data))
    .catch((error) => console.error("Error sending to server:", error));

  return serializedEncryptedMessage;
}

export async function decryptReceivedMessage(
  serializedEncryptedMessage,
  serializedEncryptedSymmetricKey,
  keyPair
) {
  await sodium.ready;

  const encryptedMessage = deserializeUint8ArrayObject(
    serializedEncryptedMessage
  );

  const encryptedSymmetricKey = deserializeUint8ArrayObject(
    serializedEncryptedSymmetricKey
  );

  const symmetricKey = decryptSymmetricKey(encryptedSymmetricKey, keyPair);

  const decryptedMessage = decryptMessage(
    encryptedMessage.nonce,
    encryptedMessage.cipher,
    symmetricKey
  );

  return decryptedMessage;
}
