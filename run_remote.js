const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const args = process.argv.slice(2);
const command = args.join(' ');

conn.on('ready', () => {
  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', (code, signal) => {
      console.log(out);
      conn.end();
      process.exit(code);
    }).on('data', (data) => {
      out += data;
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish(['QCgLZ98on7WeQM4cHLae']);
}).connect({
  host: '95.111.229.39',
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync('C:\\Users\\320301827\\Downloads\\07-06-2026-10-25-49_files_list\\resto-server')
});
