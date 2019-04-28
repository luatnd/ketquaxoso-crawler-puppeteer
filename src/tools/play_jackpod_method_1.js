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


const number = "01";
const dateFrom = "01-03-2018";
const dateTo = "29-04-2019";


const winCostFactor = 70; // Thang duoc 1 an 70
const lv1_dayCount = 65; // 65 ngay cho lv1
const lv1_dayCost = 1; // 1k vnd
const lv2_dayCount = 35; // 35 ngay cho lv2
const lv2_dayCost = 2; // 2k vnd
const lv3_dayCount = 35; // 35 ngay cho lv3
const lv3_dayCost = 3; // 3k vnd

function getDayCostOf(dayPlayed) {
  return dayPlayed <= lv1_dayCount
    ? lv1_dayCost
    : dayPlayed <= lv1_dayCount + lv2_dayCount
      ? lv2_dayCost
      : lv3_dayCost
}

function ObjectId() {

}

/**
 * ===== Init data ====
 */
const df = moment(dateFrom, Config.dateFormat);
const dt = moment(dateTo, Config.dateFormat);
const dayCount = dt.diff(df, 'd') + 1;

console.log('{} Play duration: ', dayCount, 'days');

startPlay().then(() => MongoClient.close());

async function startPlay() {
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

        console.log('{query mongo} result: ', result);
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
  let playResult = {
    dayPlayed: 0,
    totalCost: 0,
    totalWin: 0,
    balance: 0, // totalCost - totalWin
  };
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
    playResult.balance = playResult.totalWin - playResult.totalCost;

    if (win) {
      // Record win history
      winHistory[currDateStr] = Object.assign({}, playResult);
    }
  }

  /**
   * === Result ===
   */
  console.log('{} playResult: ', JSON.stringify(playResult, null, 2));
  console.log('{} winHistory: ', JSON.stringify(winHistory, null, 2));
}
