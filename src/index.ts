import * as core from '@actions/core';
import * as cli from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/tool-cache';
import * as path from 'path';

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

async function install(version = '3.0.10') {
    const system = getSystemPreset();
    const path = cache.find(TOOL, version);

    if (path) {
        return path;
    }

    await cli.exec('npm', ['install', '-g', `--prefix ${system.folder}`, `expo-cli@${version}`]);
    return await cache.cacheDir(system.folder, TOOL, version);
}

async function run() {
    const expoPath = await install();

    core.addPath(path.join(expoPath, 'node_modules', '.bin'));

    const username = core.getInput('expo-username');
    const password = core.getInput('expo-password');

    if (username && password) {
        await cli.exec('expo login', [`--username="${username}"`, `--password="${password}"`]);
    }
}

run();
