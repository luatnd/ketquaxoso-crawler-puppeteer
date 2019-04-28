/**
 * How to:
 *    Ta chỉ đánh duy nhất một con đề với số tiền 1000đ trong 65 ngày đầu tiên!!
 *      Nếu trúng đề, số tiền thu về là 70 000đ, số tiền mất cao nhất 65 000=>ít nhất lãi 5000
 *      Nếu trượt cả 65 ngày, xác xuất để 35 ngày còn lại trúng là rất rất cao, coi=100%
 *    Trong 35 ngày sau, ta vẫn đánh con đề đó với số tiền 2000, vì xác xuất trúng rất cao=>thu về 140 000,
 *    số tiền bỏ ra cao nhất 65000+2000x35=135 000
 *    => ít nhất lãi 5000
 */

const moment = require('moment');
const Config = require('../config');
const MongoClient = require('../clients/MongoClient');
const PlayResult = require('../models/PlayResult');

/**
 * Các cấu hình lvX đều được giữ đảm bảo tỉ lệ lãi là 20%
 */
const stopIfWin = true;
const expectedProfitRate = 0.2; // 20%
const winCostFactor = 70; // Thang duoc 1 an 70


// const lv1_dayCost = 1; // 1k vnd: 70 - 56 * 1 = 14; 14/70 = 20%
// const lv1_dayCount = getLvXDayCount(0, lv1_dayCost); // so ngay cho lvX de dam bao lai 20%
// const lv1_spent = 0 + lv1_dayCost * lv1_dayCount;
// const lv2_dayCost = 1.2; // 2k vnd
// const lv2_dayCount = getLvXDayCount(lv1_spent, lv2_dayCost); // so ngay cho lvX de dam bao lai 20%
// const lv2_spent = lv1_spent + lv2_dayCost * lv2_dayCount;
// const lv3_dayCost = 1.5; // 3k vnd
// const lv3_dayCount = getLvXDayCount(lv2_spent, lv3_dayCost); // so ngay cho lvX de dam bao lai 20%
// const lv3_spent = lv2_spent + lv3_dayCost * lv3_dayCount;
// const lv4_dayCost = 2; // 3k vnd
// const lv4_dayCount = getLvXDayCount(lv3_spent, lv4_dayCost); // so ngay cho lvX de dam bao lai 20%
// const lv4_spent = lv3_spent + lv4_dayCost * lv4_dayCount;
// const maxDurationToEnsureExpectedProfit =
//         lv1_dayCount +
//         lv2_dayCount +
//         lv3_dayCount +
//         lv4_dayCount
// ;

// ===> Change to calculate automatically
const lvx_dayCost = [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 18, 20, 22, 24, 26, 28, 29, 30];
const lvx_dayCount = [];
const lvx_spent = [];
for (let i = 0, c = lvx_dayCost.length; i < c; i++) {
  const lv_curr_dayCost = lvx_dayCost[i];
  const lv_prev_spent = i - 1 < 0 ? 0 : lvx_spent[i - 1];
  const lv_curr_dayCount = getLvXDayCount(lv_prev_spent, lv_curr_dayCost); // so ngay cho lvX de dam bao lai 20%
  const lv_curr_spent = lv_prev_spent + lv_curr_dayCost * lv_curr_dayCount;

  lvx_dayCount[i] = lv_curr_dayCount;
  lvx_spent[i] = lv_curr_spent;
}
const maxDurationToEnsureExpectedProfit = lvx_dayCount.reduce((acc, i) => acc + i);
console.log('{} maxDurationToEnsureExpectedProfit: ', maxDurationToEnsureExpectedProfit);


startPlaySomeJackpod(
  // [],
  ["02", "08", "12", "98", "99"],
  "01-10-2018",
  "27-04-2019"
)
// startPlayAJackpod("89", "01-01-2019", "29-04-2019")

/**
 * Close connection after play
 */
  .then(() => MongoClient.close());


/**
 * So ngay toi da co the choi o level X de dam bao lai dam bao lai = expectedProfitRate
 */
function getLvXDayCount(spent, lv_dayCost) {
  // (70k - 20% of 70k) / 1k = 56 days
  let days = (lv_dayCost * winCostFactor - lv_dayCost * winCostFactor * expectedProfitRate - spent) / lv_dayCost;
  days = Math.floor(days);
  console.log('{getLvXDayCount} lv_dayCost, days: ', lv_dayCost, days);

  return days;
}

// function getDayCostOf(dayPlayed) {
//   return dayPlayed <= lv1_dayCount
//     ? lv1_dayCost
//     : dayPlayed <= lv1_dayCount + lv2_dayCount
//       ? lv2_dayCost
//       : lv3_dayCost
// }

function getDayCostOf(dayPlayed) {
  let tmp = 0;
  let i = -1;
  while (tmp < dayPlayed) {
    i++;
    tmp += lvx_dayCount[i];
  }

  let lv_suitable_dayCost;
  if (i < lvx_dayCost.length) {
    lv_suitable_dayCost = lvx_dayCost[i];
  } else {
    lv_suitable_dayCost = 0;
    console.log("{getDayCostOf} WARN: lvx_dayCost length <= " + i);
  }
  // console.log('{getDayCostOf} dayPlayed: ', dayPlayed, lv_suitable_dayCost);

  return lv_suitable_dayCost;
}

function initAllNumber() {
  const numbers = [];
  for (let i = 0; i < 100; i++) {
    const number = i.toString().padStart(2, '0'); // Make 1 become "01"
    numbers.push(number);
  }
  return numbers;
}

/**
 *
 * @param {[]} numbers Array of jackpod number you wanna play
 * @param dateFrom
 * @param dateTo
 * @returns {Promise<void>}
 */
async function startPlaySomeJackpod(numbers, dateFrom, dateTo) {
  const playResults = {};
  const winHistories = {};

  if (!numbers || numbers.length === 0) {
    numbers = initAllNumber()
  }

  const df = moment(dateFrom, Config.dateFormat);
  const dt = moment(dateTo, Config.dateFormat);
  const dayCount = dt.diff(df, 'd') + 1;


  for (let i = 0, c = numbers.length; i < c; i++) {
    const number = numbers[i];
    const {
      playResult,
      winHistory,
    } = await startPlayAJackpod(number, dateFrom, dateTo);

    playResults[number] = playResult;
    winHistories[number] = winHistory;
  }

  console.log('\n{startPlayAllJackpod} playResults: ', JSON.stringify(playResults, null, 2));

  const playResultTotal = new PlayResult();
  playResultTotal.dayPlayed = dayCount;

  const keys = Object.keys(playResults);
  for (let i = 0, c = keys.length; i < c; i++) {
    const k = keys[i];
    const v = playResults[k]; // v:PlayResult

    const playResult = v;
    playResultTotal.totalCost += playResult.totalCost;
    playResultTotal.totalWin += playResult.totalWin;
  }

  console.log('\n{startPlayAllJackpod} playResultTotal: ', playResultTotal);
}

async function startPlayAJackpod(number, dateFrom, dateTo) {
  /**
   * ===== Init data ====
   */
  const df = moment(dateFrom, Config.dateFormat);
  const dt = moment(dateTo, Config.dateFormat);
  const dayCount = dt.diff(df, 'd') + 1;

  console.log('\n');
  console.log('\n');
  console.log('{} ========== Play jackpod: ', number);
  console.log('{} Play from: ', dateFrom);
  console.log('{} Play to:   ', dateTo);
  console.log('{} Play duration: ', dayCount, 'days');
  console.log('\n');

  if (dayCount > maxDurationToEnsureExpectedProfit) {
    console.log('{startPlayAJackpod} WARN: dayCount > maxDurationToEnsureExpectedProfit, please re-config the `lvx_dayCost` !');
    console.log('{startPlayAJackpod} STOPPED!');

    process.exit();
  }

  const db = await MongoClient.getDb('xoso');

  // query db to get all jackpod eq to number in year 2018
  let queryResult = [
    // {
    //   "_id": ObjectId("5cc5352858e54d19842fdd6e"),
    //   "0": [
    //     "41702"
    //   ],
    //   "date": "20190426"
    // },
  ];

  queryResult = await new Promise(resolve => {
    db.collection('daily_result')
      .find(
        {
          "0": new RegExp('.*' + number + '$', 'i'),
          $and: [
            { "date": { $gte: df.format(Config.dbDateFormat) } },
            { "date": { $lte: dt.format(Config.dbDateFormat) } }
          ],
        },
        { projection: { "date": 1, "0": 1, '_id': 0, } }
      )
      .sort({ "date": -1 })
      .toArray(function (err, result) {
        if (err) throw err;

        // console.log('{query mongo} result: ', result);
        resolve(result);
      });
  });

  /**
   * {20190308: true}
   */
  const appearedDates = {};
  queryResult.map(i => {
    appearedDates[i.date] = true;
  });

  /**
   * ====== Play =====
   */
  let playResult = new PlayResult();
  let winHistory = {
    // "20190308": playResult,
  };

  let dayPlayed = 0;
  for (let i = 1; i <= dayCount; i++) {
    dayPlayed = i;

    const currDate = df.clone().add(dayPlayed, 'd');
    const currDateStr = currDate.format("YYYYMMDD");

    const dayCost = getDayCostOf(dayPlayed);
    let win = (currDateStr in appearedDates);

    playResult.dayPlayed = dayPlayed;
    playResult.totalCost += dayCost;
    playResult.totalWin += win ? winCostFactor * dayCost : 0;

    if (win) {
      // Record win history
      winHistory[currDateStr] = Object.assign({}, playResult);

      if (stopIfWin) {
        break;
      }
    }
  }

  /**
   * === Result ===
   */
  // console.log('\n');
  // console.log('{} playResult: ', JSON.stringify(playResult, null, 2));
  // console.log('{} winHistory: ', JSON.stringify(winHistory, null, 2));

  return {
    playResult,
    winHistory,
  }
}
