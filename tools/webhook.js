const http = require("http");
const crypto = require("crypto");
const child_process = require("child_process");
const exec = child_process.exec;
var createHandler = require("github-webhook-handler");
var handler = createHandler({
    path: "/",
    secret: process.env.GITHUB_WEBHOOK_SECRET,
});

// ----------------------------------------------------------------------------
//   Functions/Methods/etc:
// ----------------------------------------------------------------------------

/**
 * Run the deployment script
 * @param {string} target (optional)
 */
function deploy(target) {
    exec(
        target
            ? `cd ${process.env.IBF_SYSTEM_REPO} && bash ./tools/deploy.sh "${target}"`
            : `cd ${process.env.IBF_SYSTEM_REPO} && bash ./tools/deploy.sh`,
        function (error, stdout, stderr) {
            if (error) {
                console.log(stderr);
            } else {
                console.log(stdout);
            }
        }
    );
}

// ----------------------------------------------------------------------------
//   Webhook Service:
// ----------------------------------------------------------------------------

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end("no such location");
    });
}).listen(process.env.NODE_PORT);

handler.on("create", function (event) {
    if (process.env.NODE_ENV === "test" && event.payload.ref_type === "tag") {
        console.log("Deploy started");
        deploy(event.payload.ref);
    }
});

handler.on("release", function (event) {
    if (
        ["staging", "production"].indexOf(process.env.NODE_ENV) >= 0 &&
        event.payload.action === "published"
    ) {
        console.log("Deploy started");
        deploy(event.payload.release.tag_name);
    }
});

console.log(`Listening on port ${process.env.NODE_PORT}`);
