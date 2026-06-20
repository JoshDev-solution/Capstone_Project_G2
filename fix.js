const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/Capstone_Project_VCMS/frontend/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // The exact string to find
    const searchString = 'const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");';
    
    // The replacement string
    const replaceString = 'let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");\n      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;';
    
    let newContent = content.split(searchString).join(replaceString);
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Fixed', file);
    }
});
