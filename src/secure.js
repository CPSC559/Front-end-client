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

async function sendEncryptedMessage(message, publicKeys) {
  await sodium.ready;
  const symmetricKey = generateSymmetricKey();
  let encryptedMessage = encryptMessage(message, symmetricKey);

  encryptedMessage.recipients = {};
  const decoder = new TextDecoder();

  // Sending the encrypted data to each recipient
  publicKeys.forEach((publicKey) => {
    const decodedPublicKey = decoder.decode(publicKey);
    encryptedMessage.recipients[decodedPublicKey] = encryptSymmetricKey(
      symmetricKey,
      publicKey
    );
  });

  return serializeEncryptedMessage(encryptedMessage);
}

async function decryptReceivedMessage(serializedEncryptedMessage, keyPair) {
  await sodium.ready;

  const encryptedMessage = deserializeEncryptedMessage(
    serializedEncryptedMessage
  );

  const symmetricKey = decryptSymmetricKey(
    encryptedMessage.encryptedSymmetricKey,
    keyPair
  );

  const decryptedMessage = decryptMessage(
    encryptedMessage.nonce,
    encryptedMessage.cipher,
    symmetricKey
  );

  return decryptedMessage;
}

function serializeEncryptedMessage(encryptedMessage) {
  return JSON.stringify(encryptedMessage, (_, value) => {
    if (value instanceof Uint8Array) {
      return Array.from(value);
    }
    return value;
  });
}

function deserializeEncryptedMessage(serializedEncryptedMessage) {
  return JSON.parse(serializedEncryptedMessage, (_, value) => {
    if (Array.isArray(value)) {
      return new Uint8Array(value);
    }
    return value;
  });
}

module.exports = {
  generateKeyPair,
  sendEncryptedMessage,
  decryptReceivedMessage,
  serializeEncryptedMessage,
  deserializeEncryptedMessage,
};
