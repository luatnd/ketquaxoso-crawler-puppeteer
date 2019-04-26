// 3rd party lib
const devices = require('puppeteer/DeviceDescriptors');

// app lib
const { getShotOpt } = require('../utils/screenshot');
const FileUtil = require('../utils/File');


const device = devices['Blackberry PlayBook landscape'];

exports.startCrawlAllDailyResult = async function (browser) {
  console.log("start to crawl: ");
  
  const page = await browser.newPage();
  await page.emulate(device);
  
  
  // Allows you to intercept a request; must appear before
  // your first page.goto()
  await page.setJavaScriptEnabled(false);
  
  // Request intercept handler... will be triggered with
  // each page.goto() statement
  await page.goto('http://ketqua.net/so-ket-qua');
  
  const datefrom = 2;
  const dateto = 2;
  await crawlMonthlyData(page, dateFrom, dateTo);
}

/**
 * String
 *
 * @param page puppeteer page instance
 * @param dateFrom
 * @param dateTo
 */
async function crawlMonthlyData(page, dateFrom, dateTo) {
  // Type our query into the search bar
  const dayCount = datediff(dateTo, dateFrom);
  const debugKey = dateFrom + '_' + dateTo;
  await page.type('form[action="/so-ket-qua"] input#date', dateFrom);
  await page.type('form[action="/so-ket-qua"] input#count', dayCount);
  
  // Submit form
  await page.$eval('form[action="/so-ket-qua"]', form => form.submit());
  
  // Save screenshot
  await page.screenshot(getShotOpt('submitted_form_' + debugKey));
  
  const kqEle = await page.$('.kqbackground .panel:nth-child(6) .panel-body');
  const kqEleHtml = await page.evaluate(el => el.outerHTML, kqEle);
  
  console.log("kqEle: ", kqEle);
  console.log("kqEleHtml: ", kqEleHtml);
  
  
  // Save kqEle to output for later data mining
  FileUtil.saveHtml('so-ket-qua_' + debugKey, kqEleHtml);
  
  // Then we use another process to process this html, such as via redis queue > another process
  // Send task to redis queue
}

/**
 *
 * @param {ElementHandle | String} kqEle
 * TODO: Support pass as string
 */
exports.parseMonthlyData = function (kqEle) {
  // each day: parse daily data
  const dayData = {
    // Giải: kq cua giai
    0: ["63414"],
    1: ["76044"],
    2: ["42925", "89790"],
    3: ["42925", "89790"],
    4: ["42925", "89790"],
    5: ["42925", "89790"],
    6: ["42925", "89790"],
    7: ["42925", "89790"],
  }
  
  // save to json file
  FileUtil.saveJson('20020502', dayData);
}
