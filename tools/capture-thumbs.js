// 장면 그림 다시 찍기: node tools/capture-thumbs.js [id]
// 영상 10편(엔진으로 만든 것)의 장면 끝부분(5.75초 지점)을 720×432 JPEG로 캡처해 assets/thumbs/<id>-<장면>.jpg 에 쓴다.
// 링크 미리보기(og:image)에 쓰이므로 영상을 고친 뒤에는 다시 찍는다.
// playwright가 필요하다: npm i playwright && npx playwright install chromium
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const IDS = ['climate-tf', 'education', 'integrated', 'haps', 'quota', 'network', 'mobile-air', 'vehicles', 'fuel', 'road'];
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg'};
(async () => {
  const { chromium } = require('playwright');
  const server = http.createServer((req, res) => { const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end() }
    res.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res) });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port, only = process.argv[2];
  const browser = await chromium.launch(), page = await browser.newPage({viewport: {width: 1256, height: 1000}, deviceScaleFactor: 1});
  for (const id of IDS) { if (only && only !== id) continue;
    await page.goto(`http://127.0.0.1:${port}/${id}.html?t=0`, {waitUntil: 'load'}); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(800);
    for (let i = 0; i < 5; i++) {
      const url = await page.evaluate(t => { window.CINE_seek(t, undefined, true); const o = document.createElement('canvas'); o.width = 720; o.height = 432; const g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(document.getElementById('cv'), 0, 0, 720, 432); return o.toDataURL('image/jpeg', .84) }, i * 6 + 5.75);
      fs.writeFileSync(path.join(root, 'assets', 'thumbs', `${id}-${i + 1}.jpg`), Buffer.from(url.split(',')[1], 'base64')) }
    console.log('thumbs', id) }
  await browser.close(); server.close();
})();
