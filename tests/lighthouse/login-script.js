const IBF_LOGIN_PATH = process.env.IBF_LOGIN_PATH;
const LOGIN_USER = process.env.LOGIN_USER;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD;

const locators = {
    inputLoginEmail: 'input[type="email"]',
    inputLoginPassword: 'input[type="password"]',
    loginForm: ".login-form",
};

module.exports = async (browser, context) => {
    if (context.url.includes(IBF_LOGIN_PATH)) {
        console.log(
            `Skip '${context.options.puppeteerScript}' for '${context.url}'`
        );
    } else {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(context.url + IBF_LOGIN_PATH);
        await page.waitForSelector(locators.inputLoginEmail, { visible: true });

        // Fill in and submit login form.
        const emailInput = await page.$(locators.inputLoginEmail);
        await emailInput.type(LOGIN_USER);
        const passwordInput = await page.$(locators.inputLoginPassword);
        await passwordInput.type(LOGIN_PASSWORD);
        await Promise.all([
            page.$eval(locators.loginForm, form => form.submit()),
            page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]).catch(function (err) {
            console.log("Login Failed");
            process.exit(1);
        });

        await page.close();
    }
};
