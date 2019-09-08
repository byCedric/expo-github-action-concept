import * as core from '@actions/core';
import * as cli from '@actions/exec';
import * as cache from '@actions/tool-cache';
import * as path from 'path';

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

async function run() {
    const version = core.getInput('version');
    const system = getSystemPreset();

    await cli.exec('yarn', ['add', `expo-cli@${version}`], { cwd: system.folder });

    core.addPath(path.join(system.folder, 'node_modules', '.bin'));

    const username = core.getInput('username');
    const password = core.getInput('password');

    if (username && password) {
        await cli.exec('expo', ['login', '--non-interactive', `--username ${username}`], {
            env: { EXPO_CLI_PASSWORD: password },
        });
    }
}

run();
