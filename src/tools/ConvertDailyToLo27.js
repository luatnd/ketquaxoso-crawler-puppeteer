/**
 * NOTE: Run with `node src/tools/ConvertDailyToLo27.js`
 *
 * Flow:
 *  Read output/json/*.json
 *  Transform daily result into lo27 result
 *  Write to output/lo27/*.json
 */
const fs = require('fs');
const JsonInputPath = './output/json/';
const JsonOutputPath = './output/lo27/';

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }

    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, 'utf-8', function (err, content) {
        if (err) {
          onError(err);
          return;
        }

        onFileContent(filename, content);
      });
    });
  });
}

function writeFile(fileName, data) {
  fs.writeFile(JsonOutputPath + fileName, JSON.stringify(data, null, 2), function (err) {
    if (err) console.log("err: ", err);
  });
}

function transformToLo27Data(fileName, content) {
  if (fileName === '.gitkeep') {
    return;
  }

  const date = fileName.substr(0, 8);
  let dateResult = JSON.parse(content);

  /**
   * transform ket qua xo so daily => ket qua lo de tien query hon
   */
  // Tong hop ket qua theo so theo ngay
  const dateResultLo27 = { date };
  for (let i = 0; i < 100; i++) {
    const number = i.toString().padStart(2, '0'); // Make 1 become "01"
    const countNumber = countNumberInDateResult(number, dateResult);
    dateResultLo27[number] = countNumber;
  }

  writeFile(fileName, dateResultLo27);
}

function countNumberInDateResult(number, dateResult) {
  let count = 0;

  count += dateResult["0"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["1"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["2"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["3"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["4"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["5"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["6"].reduce((acc, i) => acc + i.endsWith(number), 0);
  count += dateResult["7"].reduce((acc, i) => acc + i.endsWith(number), 0);

  return count;
}

readFiles(JsonInputPath, transformToLo27Data, err => console.log(err));

