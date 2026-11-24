const fs = require('fs');
const content = fs.readFileSync('database_simka.sql', 'utf8');
const lines = content.split('\n');
const tables = [];
for (const line of lines) {
  const match = line.match(/CREATE TABLE `(\w+)`/);
  if (match) {
    tables.push(match[1]);
  }
}
console.log('Total tables in SIMKA:', tables.length);
console.log(JSON.stringify(tables, null, 2));

// Generate SQL rename script
const renames = tables.map(t => `RENAME TABLE \`${t.toLowerCase()}\` TO \`${t}\`;`);
console.log('\n--- SQL RENAMES ---');
console.log(renames.join('\n'));
