const fs = require('fs');

exports.saveHtml = function (fileName, fileContent) {
  const HtmlOutputPath = 'output/html/'
  fs.writeFile(HtmlOutputPath + fileName + '.html', fileContent, function (err) {
    if (err) console.log("err: ", err);
    console.log('Saved!');
  });
}

exports.saveJson = function (fileName, data) {
  const JsonOutputPath = 'output/json/'
  fs.writeFile(JsonOutputPath + fileName + '.json', JSON.stringify(data, null, 2), function (err) {
    if (err) console.log("err: ", err);
    console.log('Saved!');
  });
}
