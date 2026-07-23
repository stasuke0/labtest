const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('UI and Integration Testing over HTTP', function() {
    this.timeout(15000); // Give Docker time to start the app
    let driver;

    before(async function() {
        // Run Chrome in headless mode so it works seamlessly on GitHub Actions
        let options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    after(async function() {
        await driver.quit();
    });

    it('should load the home page and locate the search button', async function() {
        // Hit the web server over HTTP (Integration Test)
        await driver.get('http://localhost:8080');
        
        // UI Test: Verify the search button is present
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        const btnText = await submitBtn.getText();
        
        assert.strictEqual(btnText, 'Search');
    });
});