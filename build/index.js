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
const npm = require('libnpm');
const TOOL = 'expo-cli-test';
function resolve(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = yield npm.manifest(`expo-cli@${version}`);
        if (!manifest.version) {
            throw new Error(`Could not find expo-cli version "${version}"`);
        }
        return manifest.version;
    });
}
function install(version, manager = 'npm') {
    return __awaiter(this, void 0, void 0, function* () {
        let expoPath = cache.find(TOOL, version);
        const managers = yield Promise.all([
            io.which('yarn'),
            io.which('npm'),
        ]);
        console.log(managers);
        if (!expoPath) {
            expoPath = process.env['RUNNER_TEMP'] || '';
            yield io.mkdirP(expoPath);
            switch (manager) {
                case 'npm':
                    yield cli.exec('npm', ['install', `expo-cli@${version}`], { cwd: expoPath });
                    break;
                case 'yarn':
                    yield cli.exec('yarn', ['add', `expo-cli@${version}`], { cwd: expoPath });
                    break;
                default:
                    throw new Error(`Unknown manager "${manager}"`);
            }
            expoPath = yield cache.cacheDir(expoPath, TOOL, version);
        }
        return path.join(expoPath, 'node_modules', '.bin');
    });
}
function authenticate(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (username && password) {
            yield cli.exec('expo', ['login', `--username=${username}`], {
                env: Object.assign(Object.assign({}, process.env), { EXPO_CLI_PASSWORD: password }),
            });
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = yield resolve(core.getInput('expo-version'));
        const expoPath = yield install(version, core.getInput('expo-manager'));
        core.addPath(expoPath);
        yield authenticate(core.getInput('expo-username'), core.getInput('expo-password'));
    });
}
run();
