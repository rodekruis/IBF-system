const LIGHTHOUSE_SERVER_URL = process.env.LIGHTHOUSE_SERVER_URL;
const LIGHTHOUSE_SERVER_LOGIN_USER = process.env.LIGHTHOUSE_SERVER_LOGIN_USER;
const LIGHTHOUSE_SERVER_LOGIN_PASSWORD =
    process.env.LIGHTHOUSE_SERVER_LOGIN_PASSWORD;
const LIGHTHOUSE_BUILD_TOKEN = process.env.LIGHTHOUSE_BUILD_TOKEN;
const IBF_TEST_URL = process.env.IBF_TEST_URL;
const IBF_LOGIN_PATH = process.env.IBF_LOGIN_PATH;

module.exports = {
    ci: {
        collect: {
            url: [IBF_TEST_URL, `${IBF_TEST_URL}${IBF_LOGIN_PATH}`],
            puppeteerScript: "./tests/lighthouse/login-script.js",
            puppeteerLaunchOptions: {
                defaultViewport: null,
                args: ["--disable-gpu --window-size=1280,720", "--no-sandbox"],
                headless: true,
            },
            headful: false,
            isSinglePageApplication: true,
            disableStorageReset: true,
            settings: {
                output: "json",
                maxWaitForFcp: 30000,
                maxWaitForLoad: 45000,
                throttlingMethod: "simulate",
                auditMode: false,
                gatherMode: false,
                disableStorageReset: true,
                formFactor: "desktop",
                screenEmulation: {
                    disabled: true,
                },
                channel: "devtools",
                budgets: null,
                locale: "en-US",
                blockedUrlPatterns: [],
                additionalTraceCategories: null,
                extraHeaders: null,
                precomputedLanternData: null,
                onlyCategories: [
                    "performance",
                    "pwa",
                    "best-practices",
                    "accessibility",
                ],
                skipAudits: [],
            },
        },
        assert: {
            assertions: {
                "categories:performance": ["warn", { minScore: 0.7 }],
                "categories:accessibility": ["warn", { minScore: 0.7 }],
            },
        },
        upload: {
            target: "lhci",
            token: LIGHTHOUSE_BUILD_TOKEN,
            serverBaseUrl: LIGHTHOUSE_SERVER_URL,
            basicAuth: {
                username: LIGHTHOUSE_SERVER_LOGIN_USER,
                password: LIGHTHOUSE_SERVER_LOGIN_PASSWORD,
            },
        },
    },
};
