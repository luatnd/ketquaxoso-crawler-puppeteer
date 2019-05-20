/**
 * NOTE: Run with `node src/tools/ModifyJsonFile.js`
 *
 * + Add date info to json file
 */
const fs = require('fs');

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }

    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }

        onFileContent(filename, content);
      });
    });
  });
}

const JsonOutputPath = './output/json/';
readFiles(JsonOutputPath, addDateInfo, (err) => {
  console.log(err)
});

function addDateInfo(fileName, content) {
  if (fileName === '.gitkeep') {
    return;
  }

  console.log('{addDateInfo} fileName, content: ', fileName);
  const date = fileName.substr(0, 8);
  let contentData = JSON.parse(content);
  contentData = Object.assign({ date }, contentData);

  writeFile(fileName, contentData);
}

function writeFile(fileName, data) {
  fs.writeFile(JsonOutputPath + fileName, JSON.stringify(data, null, 2), function (err) {
    if (err) console.log("err: ", err);
  });
}