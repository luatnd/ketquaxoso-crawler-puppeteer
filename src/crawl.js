/**
 * Crawl process to:
 *    read
 *    parse html file
 *    Get data
 *    Insert to mysql db
 */


const puppeteer = require('puppeteer');

const KQNet_SoKetQua_Crawler = require('./ketqua.net/soKetQua');

puppeteer.launch().then(async browser => {
  await KQNet_SoKetQua_Crawler.startCrawlAllDailyResult(browser);
  
  // await browser.close();
});