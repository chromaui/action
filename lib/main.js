"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const uuid_1 = require("uuid");
const main_1 = require("chromatic/bin/main");
const parseArgs_1 = __importDefault(require("chromatic/bin/lib/parseArgs"));
const log_1 = require("chromatic/bin/lib/log");
const getEnv_1 = __importDefault(require("chromatic/bin/lib/getEnv"));
const maybe = (a, b = undefined) => {
    if (!a) {
        return b;
    }
    try {
        return JSON.parse(a);
    }
    catch (e) {
        return a;
    }
};
const getCommit = (event) => {
    switch (event.eventName) {
        case 'pull_request': {
            return {
                // @ts-ignore
                owner: event.payload.repository.owner.login,
                // @ts-ignore
                repo: event.payload.repository.name,
                // @ts-ignore
                branch: event.payload.pull_request.head.ref,
                // @ts-ignore
                ref: event.ref || event.payload.pull_request.head.ref,
                // @ts-ignore
                sha: event.payload.pull_request.head.sha,
            };
        }
        case 'push': {
            return {
                // @ts-ignore
                owner: event.payload.repository.owner.login,
                // @ts-ignore
                repo: event.payload.repository.name,
                branch: event.payload.ref.replace('refs/heads/', ''),
                ref: event.payload.ref,
                sha: event.payload.after,
            };
        }
        default:
            {
                core_1.setFailed(event.eventName + ' event is not supported in this action');
                return null;
            }
            ;
    }
};
async function runChromatic(options) {
    const sessionId = uuid_1.v4();
    const env = getEnv_1.default();
    const log = log_1.createLogger(sessionId, env);
    const context = Object.assign(Object.assign({}, parseArgs_1.default([])), { env, log, sessionId, flags: options });
    await main_1.runAll(context);
    const { build: { webUrl: exitUrl }, exitCode } = context;
    return {
        url: exitUrl,
        code: exitCode,
    };
}
async function run() {
    const commit = getCommit(github_1.context);
    if (!commit) {
        return;
    }
    const { branch, sha } = commit;
    try {
        const projectToken = core_1.getInput('projectToken') || core_1.getInput('appCode'); // backwards compatibility
        const buildScriptName = core_1.getInput('buildScriptName');
        const scriptName = core_1.getInput('scriptName');
        const exec = core_1.getInput('exec');
        const doNotStart = core_1.getInput('doNotStart');
        const storybookPort = core_1.getInput('storybookPort');
        const storybookUrl = core_1.getInput('storybookUrl');
        const storybookBuildDir = core_1.getInput('storybookBuildDir');
        const storybookHttps = core_1.getInput('storybookHttps');
        const storybookCert = core_1.getInput('storybookCert');
        const storybookKey = core_1.getInput('storybookKey');
        const storybookCa = core_1.getInput('storybookCa');
        const preserveMissing = core_1.getInput('preserveMissing');
        const autoAcceptChanges = core_1.getInput('autoAcceptChanges');
        const allowConsoleErrors = core_1.getInput('allowConsoleErrors');
        const exitZeroOnChanges = core_1.getInput('exitZeroOnChanges');
        const exitOnceUploaded = core_1.getInput('exitOnceUploaded');
        const ignoreLastBuildOnBranch = core_1.getInput('ignoreLastBuildOnBranch');
        process.env.CHROMATIC_SHA = sha;
        process.env.CHROMATIC_BRANCH = branch;
        const chromatic = runChromatic({
            projectToken,
            buildScriptName: maybe(buildScriptName),
            scriptName: maybe(scriptName),
            exec: maybe(exec),
            doNotStart: maybe(doNotStart),
            storybookPort: maybe(storybookPort),
            storybookUrl: maybe(storybookUrl),
            storybookBuildDir: maybe(storybookBuildDir),
            storybookHttps: maybe(storybookHttps),
            storybookCert: maybe(storybookCert),
            storybookKey: maybe(storybookKey),
            storybookCa: maybe(storybookCa),
            fromCI: true,
            interactive: false,
            preserveMissing: maybe(preserveMissing),
            autoAcceptChanges: maybe(autoAcceptChanges),
            exitZeroOnChanges: maybe(exitZeroOnChanges, true),
            exitOnceUploaded: maybe(exitOnceUploaded, false),
            allowConsoleErrors: maybe(allowConsoleErrors, false),
            ignoreLastBuildOnBranch: maybe(ignoreLastBuildOnBranch),
        });
        const [{ url, code }] = await Promise.all([
            chromatic,
        ]);
        core_1.setOutput('url', url);
        core_1.setOutput('code', code.toString());
    }
    catch (e) {
        e.message && core_1.error(e.message);
        e.stack && core_1.error(e.stack);
        e.description && core_1.error(e.description);
        core_1.setFailed(e.message);
    }
}
run();
