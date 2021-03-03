module.exports = {
    ci: {
        collect: {
            url: ["https://ibf-test.510.global"],
            headful: false,
        },
        assert: {
            assertions: {
                "categories:performance": ["warn", { minScore: 0.7 }],
                "categories:accessibility": ["warn", { minScore: 0.7 }],
            },
        },
        upload: {
            target: "lhci",
            serverBaseUrl: "http://ibf-test.510.global:9001",
            token: process.env.LIGHTHOUSE_BUILD_TOKEN,
        },
    },
};
