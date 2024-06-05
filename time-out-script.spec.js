import { By, Builder, Browser, until } from "selenium-webdriver";
// import assert from "assert";
import dotenv from "dotenv";
import chrome from "selenium-webdriver/chrome";
import logger from "./logger";
import moment from "moment-timezone";

(async function timeOutScript() {
  let driver;
  try {
    // load env
    dotenv.config();

    // Set up Chrome options
    let options = new chrome.Options();
    options.addArguments("--incognito");
    // open browser
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
    await driver.get(process.env.LOGIN_URL);

    // wait for the login input fields to appear
    const loginClientCode = await driver.wait(
      until.elementLocated(By.id("loginClientCode")),
      10000
    );
    await loginClientCode.sendKeys(process.env.LOGIN_CLIENT_CODE);

    // input loginEmployeeCode
    const employeeCodeInput = await driver.findElement(
      By.id("loginEmployeeCode")
    );
    await employeeCodeInput.sendKeys(process.env.LOGIN_EMPLOYEE_CODE);

    // input loginPassword
    const loginPassword = await driver.findElement(By.id("loginPassword"));
    await loginPassword.sendKeys(process.env.LOGIN_PASSWORD);

    // click submit button
    let submitButton = await driver.findElement(
      By.css(".ui.green.fluid.submit.button")
    );
    await submitButton.click();

    // click time out button
    const timeOutButton = await driver.wait(
      until.elementLocated(By.css('input.btn[value="Out"]')),
      10000
    );
    // timeOutButton.click();

    await driver.sleep(5000);

    // check if current date is in the log table
    const loggedTimeOutDateDiv = await driver.wait(
      until.elementLocated(
        By.css(
          "#bundy-grid .x-grid3-body > div:last-child > table > tbody > tr td div"
        )
      ),
      10000
    );
    // log if successful of not
    const loggedTimeOutDate = await loggedTimeOutDateDiv.getText();
    const currentDate = moment().tz("Asia/Manila").format("MM/DD/YYYY");
    // console.log({ loggedTimeOutDate, currentDate });
    if (loggedTimeOutDate.trim() === currentDate) {
      // has current day in the log
      const timeoutTimeDiv = await driver.wait(
        until.elementLocated(
          By.css(
            "#bundy-grid .x-grid3-body > div:last-child > table > tbody > tr td:nth-child(3) div"
          )
        ),
        10000
      );

      const timeoutText = (await timeoutTimeDiv.getText()).trim();

      if (timeoutText.length > 0) {
        logger.info("Timeout Successful!");
      } else {
        logger.error("Time-out unsuccessful!");
      }
    } else {
      logger.error(`No Time-in for current date (${currentDate})`);
    }

    // logout;
    const logoutButton = await driver.findElement(By.css('a[href="/logout"]'));
    logoutButton.click();

    // wait for the login input fields to appear (wait for login page to appear)
    await driver.wait(until.elementLocated(By.id("loginClientCode")), 10000);
  } catch (e) {
    console.log(e);
    logger.error(e);
  } finally {
    await driver.quit();
  }
})();
