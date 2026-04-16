const fs = require('fs');

const css = fs.readFileSync('src/style.css', 'utf-8').split('\n');

function get(start, end) {
  return css.slice(start - 1, end).join('\n') + '\n';
}

const files = {
  'tokens.css': get(26, 98),
  'base.css': get(1, 24) + get(100, 107) + get(255, 262) + get(2310, 2355),
  'components.css': get(109, 160) + get(161, 185) + get(186, 218) + get(219, 254) + get(1744, 1772) + get(1773, 1792) + get(1264, 1456),
  'search.css': get(1243, 1262) + get(1592, 1743),
  'image-viewer.css': get(1457, 1591),
  'bookinfo.css': get(1793, 2272) + get(2303, 2309),
  'library.css': get(264, 555) + get(2289, 2302),
  'reader.css': get(556, 986) + get(2273, 2288),
  'annotations.css': get(987, 1242)
};

fs.mkdirSync('src/css', { recursive: true });

let imports = '';
for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync('src/css/' + filename, content);
  imports += `@import url("./css/${filename}");\n`;
}

fs.writeFileSync('src/style.css', imports);
console.log('done splitting CSS!');
