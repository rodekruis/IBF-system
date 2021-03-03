module.exports = {
    ci: {
        collect: {
            url: ["https://ibf-test.510.global"],
        },
        assert: {
            assertions: {
                "categories:performance": ["warn", { minScore: 0.7 }],
                "categories:accessibility": ["warn", { minScore: 0.7 }],
            },
        },
        upload: {
            target: "lhci",
            serverBaseUrl: "http://localhost:9001/",
            token: process.env.LIGHTHOUSE_BUILD_TOKEN,
        },
    },
};
