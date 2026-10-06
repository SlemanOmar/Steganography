const MAGIC = new Uint8Array([86, 69, 73, 76, 1]);
const ITERATIONS = 600000;
const encoder = new TextEncoder();
async function key(password, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export function capacity(pixels) { return Math.max(0, Math.floor(pixels.length / 4 * 3 / 8) - 53); }
export async function seal(text, password) {
  if (!password) throw new Error('Enter a password.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:MAGIC}, await key(password, salt), encoder.encode(text)));
  const packet = new Uint8Array(37 + encrypted.length);
  packet.set(MAGIC); new DataView(packet.buffer).setUint32(5, encrypted.length);
  packet.set(salt, 9); packet.set(nonce, 25); packet.set(encrypted, 37);
  return packet;
}
export function embed(pixels, packet) {
  if (packet.length * 8 > pixels.length / 4 * 3) throw new Error('This message is too large for the image. Choose a larger picture or shorten the text.');
  const output = new Uint8ClampedArray(pixels);
  for (let bit = 0; bit < packet.length * 8; bit++) {
    const offset = Math.floor(bit / 3) * 4 + bit % 3;
    output[offset] = (output[offset] & 254) | ((packet[bit >> 3] >> (7 - bit % 8)) & 1);
  }
  return output;
}
export function extract(pixels) {
  const available = Math.floor(pixels.length / 4 * 3 / 8);
  function read(size) {
    const result = new Uint8Array(size);
    for (let bit=0;bit<size*8;bit++) result[bit >> 3] |= (pixels[Math.floor(bit/3)*4+bit%3]&1) << (7-bit%8);
    return result;
  }
  if (available < 53) throw new Error('No supported hidden message found.');
  const header = read(9);
  if (!MAGIC.every((byte,i)=>header[i]===byte)) throw new Error('No supported hidden message found.');
  const length = new DataView(header.buffer).getUint32(5);
  if (length < 16 || length > available-37) throw new Error('The hidden message is damaged.');
  return read(37+length);
}
export async function open(packet, password) {
  if (!password) throw new Error('Enter a password.');
  try {
    if (packet.length < 53 || !MAGIC.every((byte,i)=>packet[i]===byte) || new DataView(packet.buffer,packet.byteOffset,packet.byteLength).getUint32(5)!==packet.length-37) throw new Error('Invalid packet');
    const decrypted = await crypto.subtle.decrypt({name:'AES-GCM',iv:packet.slice(25,37),additionalData:MAGIC}, await key(password, packet.slice(9,25)), packet.slice(37));
    return new TextDecoder('utf-8',{fatal:true}).decode(decrypted);
  } catch { throw new Error('Could not decrypt. The password is incorrect or the image has been modified.'); }
}
