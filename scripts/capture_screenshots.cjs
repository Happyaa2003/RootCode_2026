const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

const outDir = path.join(__dirname, '..', 'designathon-html', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const htmlDir = path.join(__dirname, '..', 'designathon-html');

// We capture index.html plus key screens for the user
const screens = [
  'index.html',
  'dispatcher.html',
  'route-planner.html',
  'live-operations.html',
  'orders.html',
  'order-detail.html',
  'loader.html',
  'driver.html',
  'store-manager.html',
  'forecast.html',
  'fleet.html',
  'exceptions.html',
  'offline.html',
  'reports.html'
];

console.log(`Using browser: ${browserExe}`);

screens.forEach(file => {
  const filePath = path.join(htmlDir, file);
  if (!fs.existsSync(filePath)) return;

  const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
  const outPng = path.join(outDir, file.replace('.html', '.png'));

  console.log(`Capturing: ${file} -> ${outPng}`);
  try {
    execFileSync(browserExe, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1440,1100',
      `--screenshot=${outPng}`,
      fileUrl
    ], { timeout: 15000 });

    if (fs.existsSync(outPng)) {
      const stats = fs.statSync(outPng);
      console.log(`  ✓ Created ${path.basename(outPng)} (${(stats.size / 1024).toFixed(1)} KB)`);
    }
  } catch (err) {
    console.error(`  ✗ Error capturing ${file}:`, err.message);
  }
});

console.log('Capture process finished.');
