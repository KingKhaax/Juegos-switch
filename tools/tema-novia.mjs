import fs from "node:fs";
const dir = process.argv[2] || ".";
const MAP = [
  ["#e60012", "#ff4f9a"], ["#00c3e3", "#b98cff"], ["#1c1e24", "#2a1626"], ["#3b3e47", "#4a2c45"], ["#2c2f38", "#3a2236"],
  ["#383c48", "#47293f"], ["#262a33", "#331d30"], ["#15171d", "#1d0f1b"], ["#ff8a93", "#ffb0d2"], ["#8cf0ff", "#e2c8ff"],
  ["#00e5ff", "#d7a9ff"], ["#7defff", "#ecd2ff"], ["#a8abb8", "#cfadc2"], ["#b9bdc9", "#dcbfd0"],
  ["#ff3b50", "#ff5fa8"], ["#ff9aa4", "#ffc2dc"], ["#a80f22", "#a0246a"], ["#ff4a5c", "#ff6fb0"], ["#9ffaff", "#f0dcff"], ["#0086a0", "#7a4fc0"],
  ["rgba(230,0,18", "rgba(255,79,154"], ["rgba(0,195,227", "rgba(185,140,255"],
];
let css = fs.readFileSync(`${dir}/styles.css`, "utf8");
for (const [a, b] of MAP) css = css.split(a).join(b).split(a.toUpperCase()).join(b);
css += fs.readFileSync(`${dir}/tools/tema-novia-extra.css`, "utf8");
fs.writeFileSync(`${dir}/novia.css`, css);
console.log("novia.css", css.length);
