// Serialize an object into a JSON string
export function serializeUint8ArrayObject(obj) {
  return JSON.stringify(obj, (_, value) => {
    if (value instanceof Uint8Array) {
      return Array.from(value);
    }
    return value;
  });
}

// Deserialize a JSON string into an object
export function deserializeUint8ArrayObject(serializedObj) {
  return JSON.parse(serializedObj, (_, value) => {
    if (Array.isArray(value)) {
      return new Uint8Array(value);
    }
    return value;
  });
}
