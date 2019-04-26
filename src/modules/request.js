/**
 * Send POST, PUT, ... request with puppeteer
 */
export function post() {

}

/**
 * submitBtnSelector '#search-button'
 */
export async function submitForm(page, submitBtnSelector) {
  // await page.click(submitBtnSelector);
  await page.$eval('form-selector', form => form.submit());
  await page.waitForNavigation();
  
  /*
 
  await page.goto('https://www.example.com/login');

  await page.type('#username', 'username');
  await page.type('#password', 'password');
  
  await page.click('#submit');
  
  await page.waitForNavigation();
  
  console.log('New Page URL:', page.url());
  
   */
}
