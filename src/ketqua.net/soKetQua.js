// 3rd party lib
const devices = require('puppeteer/DeviceDescriptors');
const moment = require('moment');

// app lib
const { getShotOpt } = require('../utils/screenshot');
const FileUtil = require('../utils/File');
const PageUtil = require('../utils/Page');
const RuntimeUtil = require('../utils/Runtime');
const Config = require('../config');

const device = devices['Blackberry PlayBook'];

async function startCrawlAllDailyResult(browser) {
  console.log("start to crawl: ");

  const page = await browser.newPage();
  await page.emulate(device);


  // Allows you to intercept a request; must appear before
  // your first page.goto()
  await page.setJavaScriptEnabled(false);

  // For debugging on chrome
  tmp_page = page;

  // Request intercept handler... will be triggered with
  // each page.goto() statement
  await page.goto('http://ketqua.net/so-ket-qua');

  //

  let dateFrom = Config.dateFrom;
  let dateTo = Config.dateTo;

  await crawlMonthlyData(page, dateFrom, dateTo);
}

/**
 * Crawl data from dateFrom to EndOfMonth
 *
 * @param page puppeteer page instance
 * @param dateFrom day of month in which we start to crawl from
 * @param dateTo use to determine if it need to crawl next month or not
 */
async function crawlMonthlyData(page, dateFrom, dateTo) {
  console.log('{crawlMonthlyData} dateFrom, dateTo: ', dateFrom, dateTo);

  // Type our query into the search bar
  const df = moment(dateFrom, Config.dateFormat);
  const dt = moment(dateTo, Config.dateFormat);
  const endOfMonth = df.clone().endOf('month');
  const dayCount = endOfMonth.diff(df, 'd') + 1;

  const debugKey = df.format('YYMMDD') + '_' + endOfMonth.format('YYMMDD');

  // await page.type('form[action="/so-ket-qua"] input#date', dateFrom);
  // await page.type('form[action="/so-ket-qua"] input#count', dayCount.toString());
  /**
   * Do not use page.type() => it will prepend the text to input, not set the value
   */
  await PageUtil.set(page, 'form[action="/so-ket-qua"] input#date', dateFrom);
  await PageUtil.set(page, 'form[action="/so-ket-qua"] input#count', dayCount);

  // Submit form
  await page.$eval('form[action="/so-ket-qua"]', form => form.submit());

  // Save screenshot
  await page.screenshot(getShotOpt('submitted_form_' + debugKey));

  // Save kqEle to output for later data mining
  FileUtil.saveHtml('so-ket-qua_' + debugKey, await page.content());

  const kqEle = await page.$('.kqbackground .panel:nth-child(6) .panel-body');
  // console.log('{crawlMonthlyData} kqEle: ', kqEle);

  // Then we use another process to process this html, such as via redis queue > another process
  // Send task to redis queue
  const executeType = 'now'; // 'queue', 'now'
  if (executeType === 'now') {
    await parseMonthlyData(page, kqEle);
  }

  /**
   * Check if need to continue to crawl next days
   */
  const dayRemaining = dt.diff(endOfMonth, 'd');
  if (dayRemaining > 0) {
    const beginOfNextMonth = endOfMonth.add(1, 'day').format(Config.dateFormat);
    await crawlMonthlyData(page, beginOfNextMonth, dateTo);
  }
}

/**
 *
 * @param {page} page
 * @param {ElementHandle | String} kqEle
 * TODO: Support pass as string
 */
async function parseMonthlyData(page, kqEle) {
  // console.log('{parseDailyData} PageUtil.outerHTML(page, kqEle): ', await PageUtil.outerHTML(page, kqEle));

  // Extract the results from the page.
  const dayDataTables = await kqEle.$$('div.tb-phoi table.tb-phoi-border');
  // console.log('{parseMonthlyData} dayDataTables: ', dayDataTables);

  // tmp_dayDataTables = dayDataTables;
  dayDataTables.forEach(async dailyDataEle => {
    // await dailyDataEle.screenshot(getShotOpt('dailyEle'));
    await parseDailyData(page, dailyDataEle)
  });

  await RuntimeUtil.sleep(5000);
}

/**
 *
 * @param {page} page
 * @param {ElementHandle} dailyDataEle
 */
async function parseDailyData(page, dailyDataEle) {
  // console.log('{parseDailyData} dailyDataEle: ', await PageUtil.outerHTML(page, dailyDataEle));
  let dateStr = await dailyDataEle.$eval('#result_date', el => el.innerText);
  dateStr = dateStr.trim().replace(/.*([0-9]{2}-[0-9]{2}-[0-9]{4})$/, '$1');

  console.log('{parseDailyData} dateStr: ', dateStr);

  const date = moment(dateStr, Config.dateFormat);
  let dayData = {
    // Giải: kq cua giai
  };

  async function parsePrizeResults(prize, resultCount) {
    const results = [];
    for (let i = 0; i < resultCount; i++) {
      const prize_i = await dailyDataEle.$eval(`#rs_${prize}_${i}`, el => el.innerText.trim());
      results.push(prize_i)
    }

    return results;
  }

  // dayData = await dailyDataEle.$$eval('tr', trows => trows.map(el => el.innerText));
  dayData[0] = await parsePrizeResults(0, 1);
  dayData[1] = await parsePrizeResults(1, 1);
  dayData[2] = await parsePrizeResults(2, 2);
  dayData[3] = await parsePrizeResults(3, 6);
  dayData[4] = await parsePrizeResults(4, 4);
  dayData[5] = await parsePrizeResults(5, 6);
  dayData[6] = await parsePrizeResults(6, 3);
  dayData[7] = await parsePrizeResults(7, 4);

  // console.log('{parseDailyData} dayData: ', JSON.stringify(dayData));

  // // save to json file
  FileUtil.saveJsonSync(date.format('YYYYMMDD'), dayData);
}


exports.startCrawlAllDailyResult = startCrawlAllDailyResult;
exports.parseMonthlyData = parseMonthlyData;
