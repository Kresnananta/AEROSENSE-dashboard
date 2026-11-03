import artwork from "../../robot-display/screen/face.svg?raw";
import styles from "../../robot-display/screen/screen.css?raw";
import expression from "../../robot-display/screen/expression.js?raw";
import runtime from "../../robot-display/screen/screen.js?raw";
import document from "../../robot-display/screen/index.html?raw";

export function robotFaceDocument() {
  const expressions = expression.replace(/^export /gm, "");
  const screen = runtime.replace(/^import [^\n]+\r?\n/, "");
  const script = [
    "window.aerobotRemote = true;",
    `window.aerobotArtwork = ${JSON.stringify(artwork)};`,
    expressions,
    screen,
  ]
    .join("\n")
    .replace(/<\/script/gi, "<\\/script");
  return document
    .replace('<link rel="stylesheet" href="./screen.css">', `<style>${styles}</style>`)
    .replace(
      '<script type="module" src="./screen.js"></script>',
      `<script type="module">${script}</script>`,
    );
}
