const fs = require('fs');
const moment = require('moment');

const Config = {
  dateFrom: null,
  dateTo: null, // null mean now
  // dateFrom: '05-01-2002',
  // dateTo: '30-03-2002',
  dateFormat: "DD-MM-YYYY",
  dbDateFormat: "YYYYMMDD",
};

// If you not configure dateTo, try to set it as now()
if (!Config.dateTo) {
  Config.dateTo = moment().format('DD-MM-YYYY');
}
if (!Config.dateTo) {
  Config.dateTo = moment().format('DD-MM-YYYY');
}

/**
 * Ensure enough directory
 */
if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('tmp', { recursive: true });
}

module.exports = Config;
