"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const cli = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const cache = __importStar(require("@actions/tool-cache"));
const path = __importStar(require("path"));
const TOOL = 'expo-cli-test';
function expoInstallPath() {
    if (process.env['RUNNER_TEMP']) {
        return process.env['RUNNER_TEMP'];
    }
    switch (process.platform) {
        case 'linux': return path.join('/home', 'actions', 'temp');
        case 'darwin': return path.join('/Users', 'actions', 'temp');
        case 'win32': return path.join(process.env['USERPROFILE'] || 'C:\\', 'actions', 'temp');
        default:
            throw new Error(`Unknown system "${process.platform}"`);
    }
}
function expoFromCache(version) {
    return cache.find(TOOL, version);
}
function expoToCache(version, path) {
    return __awaiter(this, void 0, void 0, function* () {
        yield cache.cacheDir(path, TOOL, version);
    });
}
function expoFromNpm(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = expoInstallPath();
        const npm = yield io.which('npm');
        yield io.mkdirP(target);
        yield cli.exec(npm, ['install', `expo-cli@${version}`], { cwd: target });
        return target;
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = '3.0.10';
        let expoPath = expoFromCache(version);
        if (!expoPath) {
            expoPath = yield expoFromNpm(version);
            yield expoToCache(version, expoPath);
        }
        console.log('EXPO INSTALLED AT');
        console.log(expoPath);
        core.addPath(path.join(expoPath, 'node_modules', '.bin'));
        const username = core.getInput('expo-username');
        const password = core.getInput('expo-password');
        if (username && password) {
            yield cli.exec('expo login', [`--username="${username}"`, `--password="${password}"`]);
        }
    });
}
run();
