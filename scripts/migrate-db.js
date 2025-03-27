const { exec } = require('child_process');
const path = require('path');

// Run the Drizzle migration
console.log('Running database migration...');

// Use drizzle-kit to push schema changes
const drizzlePush = exec('npm run db:push');

drizzlePush.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

drizzlePush.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

drizzlePush.on('close', (code) => {
  console.log(`Database migration process exited with code ${code}`);
  if (code === 0) {
    console.log('Database migration completed successfully.');
  } else {
    console.error('Database migration failed.');
  }
});