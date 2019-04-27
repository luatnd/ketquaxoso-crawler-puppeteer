exports.set = async function (page, selector, value) {
  await page.$eval(selector, (el, val) => el.value = val, value);
};

exports.outerHTML = async function (page, elementHandleObj) {
  return await page.evaluate(el => el.outerHTML, elementHandleObj);
};
