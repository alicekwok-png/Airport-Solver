/* 由 index.html（Artifact 用嘅「body 內容」格式）產生一個**完整、獨立**
   嘅 HTML 檔去 public/，畀 Render（或者任何 static host、Capacitor）用。

   點解要呢個 build：
   index.html 本身冇 <!doctype>／<html>／<head>／<body>，因為 Artifact
   發佈嗰陣會自動包一層 skeleton。但如果原封不動放上 static host：
     1. 冇 <!doctype> → 瀏覽器行 quirks mode，版面會出事
     2. **冇 viewport meta** → 手機會當佢係 ~980px 闊嘅桌面版再縮細，
        個 game 會細到睇唔到，觸控座標亦都會唔準
   所以呢度包返一層正確嘅 head。index.html 維持原樣做單一來源，
   兩邊（Artifact／Render）都係由佢出，唔會有兩份會走樣嘅副本。 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'index.html');
const OUT_DIR = path.join(__dirname, 'public');
const OUT = path.join(OUT_DIR, 'index.html');

const body = fs.readFileSync(SRC, 'utf8');

/* 抽走 <title>（要擺入 <head>），其餘照搬 */
let title = 'Airport Solver';
const bodyNoTitle = body.replace(/<title>([\s\S]*?)<\/title>\s*/i, (_, t) => {
  title = t.trim();
  return '';
});

const html = `<!doctype html>
<html lang="zh-HK">
<head>
<meta charset="utf-8">
<title>${title}</title>
<!-- 手機必要：唔加就會當桌面版縮細，觸控亦唔準。
     user-scalable=no / maximum-scale=1 係為咗封死雙擊放大同捏合縮放，
     否則撳飛機好易觸發縮放。viewport-fit=cover 係為咗瀏海機。 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#141b2d">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${title}">
</head>
<body>
${bodyNoTitle}
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);

/* wallet.html（Web3 錢包／NFT 卡，doc _32）本身已經係完整 HTML，照抄過去 */
const WALLET = path.join(__dirname, 'wallet.html');
if (fs.existsSync(WALLET)) {
  fs.copyFileSync(WALLET, path.join(OUT_DIR, 'wallet.html'));
  console.log('copied public/wallet.html');
}
const mb = (fs.statSync(OUT).size / 1048576).toFixed(2);
console.log(`built public/index.html (${mb} MB) — title: ${title}`);
