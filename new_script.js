const fs = require('fs');

let oldScript = fs.readFileSync('public/script.js.bak', 'utf-8');

// I need to carefully rewrite this. It's better to just write the new script directly.
