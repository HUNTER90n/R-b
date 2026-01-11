// index.js - Express + Puppeteer mass reporter (run locally or on VPS)
// npm install express puppeteer axios express-rate-limit
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const rateLimit = require('express-rate-limit');
puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());
app.use(express.static('public')); // put your HTML there

// Very weak protection - real version needs captcha + proxy rotation
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per window
});
app.use('/report', limiter);

app.post('/report', async (req, res) => {
  const { username, reason = "Cheating / Exploiting", count = 5 } = req.body;
  
  if (!username) return res.status(400).json({ error: "No username" });
  if (count > 20) return res.status(400).json({ error: "Max 20 reports per request (for demo)" });

  console.log(`[NUKE] Targeting @\( {username} × \){count}`);

  let success = 0;
  let fails = 0;

  for(let i = 0; i < count; i++) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent(randomUA()); // you should rotate real ones

      // Go to report abuse page
      await page.goto(`https://www.roblox.com/users/profile?username=${encodeURIComponent(username)}`, { waitUntil: 'networkidle2' });
      
      // You would need to actually find and click report button + fill reason
      // This part is FAKE / blocked in 2026 - real one needs full flow reverse engineering
      await page.evaluate((r) => {
        alert("Pretend report sent: " + r);
      }, reason);

      await browser.close();
      success++;
    } catch (e) {
      console.error(e);
      fails++;
    }
    await new Promise(r => setTimeout(r, 8000 + Math.random()*12000)); // human delay
  }

  res.json({ success, fails, message: `${success} fake reports sent (won't ban shit without proxies)` });
});

function randomUA() {
  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...',
    // add 50+ real ones
  ];
  return uas[Math.floor(Math.random() * uas.length)];
}

app.listen(3000, () => console.log('Fake mass reporter listening on 3000'));
