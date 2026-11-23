import { resolve } from "path";
import { generateApi } from "swagger-typescript-api";

// Кодогенерация клиента API пигментов из Swagger бэкенда (Go, порт 8080)
generateApi({
  fileName: "Api.ts",
  output: resolve(process.cwd(), "./src/api"),
  url: "http://localhost:8080/swagger/doc.json",
  httpClientType: "axios",
  moduleNameFirstTag: true, // api.pigments.* и api.users.* — по тегам домена
  extractRequestBody: true,
});
