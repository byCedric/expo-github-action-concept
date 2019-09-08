import * as core from '@actions/core';
import * as cli from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/tool-cache';
import * as path from 'path';

const TOOL = 'expo-cli-test';

function expoInstallPath() {
    switch (process.platform) {
        case 'linux': return path.join('/home', 'actions', 'temp');
        case 'darwin': return path.join('/Users', 'actions', 'temp');
        case 'win32': return path.join(process.env['USERPROFILE'] || 'C:\\', 'actions', 'temp');
        default:
            throw new Error(`Unknown system "${process.platform}"`);
    }
}

function expoFromCache(version: string) {
    return cache.find(TOOL, version);
}

async function expoToCache(version: string, path: string) {
    await cache.cacheDir(path, TOOL, version);
}

async function expoFromNpm(version: string) {
    const target = expoInstallPath();
    const npm = await io.which('npm');
    await io.mkdirP(target);
    await cli.exec(npm, ['install', `expo-cli@${version}`], { cwd: target });
    return target;
}

async function run() {
    const version = '3.0.10';
    let expoPath = expoFromCache(version);

    if (!expoPath) {
        expoPath = await expoFromNpm(version);
        await expoToCache(version, expoPath);
    }

    console.log('EXPO INSTALLED AT');
    console.log(expoPath);

    core.addPath(path.join(expoPath, 'node_modules', '.bin'));

    const username = core.getInput('expo-username');
    const password = core.getInput('expo-password');

    if (username && password) {
        await cli.exec('expo login', [`--username="${username}"`, `--password="${password}"`]);
    }
}

run();
