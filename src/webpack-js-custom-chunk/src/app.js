import * as alphaTab from "@coderline/alphatab";

const element = document.querySelector("#alphaTab");
const api = new alphaTab.AlphaTabApi(element, {
  core: {
    file: "https://www.alphatab.net/files/canon.gp",
    // Resolve URL as we copied the files
    fontDirectory: new URL("/font/", document.location).href
  },
  player: {
    enablePlayer: true,
    // Resolve URL as we copied the files
    soundFont: new URL("/soundfont/sonivox.sf2", document.location).href
  },
});
