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
const cache = __importStar(require("@actions/tool-cache"));
const path = __importStar(require("path"));
const TOOL = 'expo-cli-test';
function getSystemPreset() {
    switch (process.platform) {
        case 'linux':
            return { name: 'linux', folder: path.join('/home', 'actions', 'expo-cli') };
        case 'darwin':
            return { name: 'macos', folder: path.join('/Users', 'actions', 'expo-cli') };
        case 'win32':
            return { name: 'windows', folder: path.join(process.env['USERPROFILE'] || 'C:\\', 'actions', 'expo-cli') };
        default:
            throw new Error(`Unknown operating system "${process.platform}".`);
    }
}
function install(version = '3.0.10') {
    return __awaiter(this, void 0, void 0, function* () {
        const system = getSystemPreset();
        const path = cache.find(TOOL, version);
        if (path) {
            return path;
        }
        yield cli.exec('npm', ['install', '-g', `--prefix ${system.folder}`, `expo-cli@${version}`]);
        return yield cache.cacheDir(system.folder, TOOL, version);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const expoPath = yield install();
        core.addPath(path.join(expoPath, 'node_modules', '.bin'));
        const username = core.getInput('expo-username');
        const password = core.getInput('expo-password');
        if (username && password) {
            yield cli.exec('expo login', [`--username="${username}"`, `--password="${password}"`]);
        }
    });
}
run();
