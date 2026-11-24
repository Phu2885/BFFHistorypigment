// GitHub Pages отдаёт 404.html на любой неизвестный адрес — копия index.html
// позволяет открывать страницы SPA по прямой ссылке и после F5.
import { copyFileSync } from "node:fs";
copyFileSync("dist/index.html", "dist/404.html");
