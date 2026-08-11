import { renderFlashPage } from "./pages/flash.js";

const app = document.querySelector("#app");

const flashStyles = document.createElement("link");

flashStyles.rel = "stylesheet";
flashStyles.href = "./css/flash.css";

document.head.appendChild(flashStyles);

renderFlashPage(app);
