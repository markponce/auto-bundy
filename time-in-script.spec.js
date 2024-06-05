import { By, Builder, Browser, until } from "selenium-webdriver";
// import assert from "assert";
import dotenv from "dotenv";
import chrome from "selenium-webdriver/chrome";
import logger from "./logger";
import moment from "moment-timezone";

(async function timeInScript() {
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

    // wait until timein button is loaded
    await driver.wait(
      until.elementLocated(By.css('input.btn[value="In"]')),
      10000
    );

    // click time out button
    const timeInButton = await driver.wait(
      until.elementLocated(By.css('input.btn[value="In"]')),
      10000
    );
    // timeInButton.click();

    await driver.sleep(5000);

    // check if current date is in the log table
    const loggedTimeInDateDiv = await driver.wait(
      until.elementLocated(
        By.css(
          "#bundy-grid .x-grid3-body > div:last-child > table > tbody > tr td div"
        )
      ),
      10000
    );
    // log if successful of not
    const loggedTimeInDate = await loggedTimeInDateDiv.getText();
    const currentDate = moment().tz("Asia/Manila").format("MM/DD/YYYY");
    if (loggedTimeInDate.trim() === currentDate) {
      logger.info("Time-in Successful!");
    } else {
      logger.error("Time-in Unsuccessful");
    }

    // logout
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
