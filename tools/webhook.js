const http = require("http");
const child_process = require("child_process");
const fs = require("fs");
const exec = child_process.exec;
var createHandler = require("github-webhook-handler");
var handler = createHandler({
    path: "/",
    secret: process.env.GITHUB_WEBHOOK_SECRET,
});

const today = new Date();
const todayString =
    today.getFullYear() +
    "-" +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + today.getDate()).slice(-2);
const logDirectory = "/var/tmp/";
const stdoutFileName = `ibf-${todayString}.stdout.log`;
const stderrFileName = `ibf-${todayString}.stderr.log`;
const stdoutStream = fs.createWriteStream(logDirectory + stdoutFileName, {
    flags: "a",
});
const stderrStream = fs.createWriteStream(logDirectory + stderrFileName, {
    flags: "a",
});

// ----------------------------------------------------------------------------
//   Functions/Methods/etc:
// ----------------------------------------------------------------------------

/**
 * Run the deployment script
 * @param {string} target (optional)
 */
function deploy(target) {
    const command = target
        ? `cd ${process.env.IBF_SYSTEM_REPO} && bash ./tools/deploy.sh "${target}"`
        : `cd ${process.env.IBF_SYSTEM_REPO} && bash ./tools/deploy.sh`;
    const deploy = exec(command);
    deploy.stdin.write(`Deploy Started - ${command}\r\n`);
    deploy.stdout.pipe(stdoutStream);
    deploy.stderr.pipe(stderrStream);
    deploy.stdin.end(`Deploy Complete - ${command}\r\n`);
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
    stdoutStream.write("Event Received: create");
    if (process.env.NODE_ENV === "test" && event.payload.ref_type === "tag") {
        stdoutStream.write("Event Triggered: create");
        deploy(event.payload.ref);
    }
});

handler.on("release", function (event) {
    stdoutStream.write("Event Received: release");
    if (
        ["staging", "production"].indexOf(process.env.NODE_ENV) >= 0 &&
        event.payload.action === "published"
    ) {
        stdoutStream.write("Event Triggered: release");
        deploy(event.payload.release.tag_name);
    }
});

stdoutStream.write(`Listening on port ${process.env.NODE_PORT}`);
