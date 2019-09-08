import * as core from '@actions/core';
import * as cli from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/tool-cache';
import * as path from 'path';

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

async function run() {
    const version = core.getInput('expo-version');
    const system = getSystemPreset();

    await cli.exec('npm', ['install', '-g', `--prefix ${system.folder}`, `expo-cli@${version}`]);

    core.addPath(path.join(system.folder, 'node_modules', '.bin'));

    const username = core.getInput('expo-username');
    const password = core.getInput('expo-password');

    if (username && password) {
        await cli.exec('expo login', [`--username ${username}`], {
            env: {
                ...process.env,
                EXPO_CLI_PASSWORD: password,
            },
        });
    }
}

run();
