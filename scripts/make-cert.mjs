// Самоподписанный сертификат для HTTPS dev-сервера (как в методичке: пакет mkcert).
// Создаёт certs/ca.crt, certs/ca.key (центр сертификации) и certs/cert.crt, certs/cert.key
// для localhost и IP-адресов ноутбука в локальной сети (по ним заходит телефон).
import { createCA, createCert } from "mkcert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";

const ips = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n.address);
const domains = ["localhost", "127.0.0.1", ...ips];

// центр сертификации создаётся один раз; при смене сети (новый IP) перевыпускается только сертификат
const ca = existsSync("certs/ca.key")
  ? { key: readFileSync("certs/ca.key", "utf8"), cert: readFileSync("certs/ca.crt", "utf8") }
  : await createCA({
  organization: "Historypigments dev CA",
  countryCode: "RU",
  state: "Moscow",
  locality: "Moscow",
  validity: 365,
    });
const cert = await createCert({ ca: { key: ca.key, cert: ca.cert }, domains, validity: 365 });

mkdirSync("certs", { recursive: true });
writeFileSync("certs/ca.crt", ca.cert);
writeFileSync("certs/ca.key", ca.key);
writeFileSync("certs/cert.crt", cert.cert);
writeFileSync("certs/cert.key", cert.key);
console.log("Сертификат создан для:", domains.join(", "));
