const moment = require('moment');

exports.getShotOpt = function (fileName, folder = null) {
  return {
    path: 'tmp/' + (folder ? folder + '/' : '') + moment().format('MMDD_HHmmss_SSS') + '_' + fileName + '.jpg',
    type: 'jpeg',
    quality: 30,
    fullPage: false,
  }
}
