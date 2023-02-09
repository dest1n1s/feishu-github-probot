import crypto from "crypto";

class AESCipher {
  key: Buffer;
  constructor(key) {
    const hash = crypto.createHash("sha256");
    hash.update(key);
    this.key = hash.digest();
  }

  decrypt(encrypt: string) {
    const encryptBuffer = Buffer.from(encrypt, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.key,
      encryptBuffer.slice(0, 16)
    );
    let decrypted = decipher.update(
      encryptBuffer.slice(16).toString("hex"),
      "hex",
      "utf8"
    );
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  }
}

const cipher = new AESCipher("SWaq5PXs2CVIHQTkd46sScOl1iwwQxBd");
const decrypt = (encrypt: string) => {
  return cipher.decrypt(encrypt);
};
export default decrypt;
