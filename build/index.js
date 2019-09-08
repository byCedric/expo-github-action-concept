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
const path = __importStar(require("path"));
function getSystemPreset() {
    switch (process.platform) {
        case 'linux':
            return { name: 'linux', folder: path.join('/home', 'actions', 'temp') };
        case 'darwin':
            return { name: 'macos', folder: path.join('/Users', 'actions', 'temp') };
        case 'win32':
            return { name: 'windows', folder: path.join(process.env['USERPROFILE'] || 'C:\\', 'actions', 'temp') };
        default:
            throw new Error(`Unknown operating system "${process.platform}".`);
    }
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = core.getInput('version');
        const system = getSystemPreset();
        yield cli.exec('npm', ['install', `expo-cli@${version}`, system.folder]);
        // await cli.exec('yarn', ['add', `expo-cli@${version}`]);
        core.addPath(path.join(system.folder, 'node_modules', '.bin'));
        const username = core.getInput('username');
        const password = core.getInput('password');
        if (username && password) {
            yield cli.exec('expo', ['login', '--non-interactive', `--username ${username}`], {
                env: { EXPO_CLI_PASSWORD: password },
            });
        }
    });
}
run();
