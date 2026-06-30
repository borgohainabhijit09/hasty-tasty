const { execSync } = require('child_process');

const myPid = process.pid;
const myPpid = process.ppid;
console.log(`My PID: ${myPid}, Parent PID: ${myPpid}`);

try {
  const output = execSync('tasklist /NH /FO CSV').toString();
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('node.exe')) {
      const parts = line.split(',');
      if (parts.length > 1) {
        const name = parts[0].replace(/"/g, '');
        const pidStr = parts[1].replace(/"/g, '');
        const pid = parseInt(pidStr, 10);
        
        if (pid !== myPid && pid !== myPpid) {
          console.log(`Killing ghost node process: ${pid}`);
          try {
            process.kill(pid, 'SIGKILL');
          } catch (e) {
            console.error(`Failed to kill ${pid}:`, e.message);
          }
        }
      }
    }
  }
  console.log("Clean up completed.");
} catch (err) {
  console.error(err);
}
