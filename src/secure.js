const sodium = require("libsodium-wrappers");

async function generateKeyPair() {
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

async function sendEncryptedMessage(message, publicKeys) {
  await sodium.ready;
  const symmetricKey = generateSymmetricKey();
  const encryptedMessage = encryptMessage(message, symmetricKey);

  // Sending the encrypted data to each recipient
  publicKeys.forEach((publicKey) => {
    // encrypt the symmetric key
    const encryptedSymmetricKey = encryptSymmetricKey(symmetricKey, publicKey);

    // Logging encryptedSymmetricKey, nonce, ciphertext, and mac for each recipient (placeholder for sending)
    console.log("Sending to recipient:", publicKey);
    console.log("Encrypted Symmetric Key:", encryptedSymmetricKey);
    console.log("Nonce:", encryptedMessage.nonce);
    console.log("Ciphertext:", encryptedMessage.ciphertext);
    console.log("MAC:", encryptedMessage.mac);
    console.log("\n");
  });
}

async function decryptReceivedMessage(encryptedData, privateKey) {
  await sodium.ready;
  const { nonce, ciphertext, mac, encryptedSymmetricKey } = encryptedData;

  const symmetricKey = decryptSymmetricKey(encryptedSymmetricKey, privateKey);
  const decryptedMessage = decryptMessage(
    { nonce, ciphertext, mac },
    symmetricKey
  );

  return decryptedMessage;
}

module.exports = {
  generateKeyPair,
  sendEncryptedMessage,
  decryptReceivedMessage,
};
