import * as core from '@actions/core';
import * as cli from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/tool-cache';
import * as path from 'path';

const TOOL = 'expo-cli-test';

function temporaryPath() {
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

async function resolve(version: string) {
    return '3.0.10';
}

async function install(version: string) {
    let expoPath = cache.find(TOOL, version);

    if (!expoPath) {
        expoPath = temporaryPath();

        await io.mkdirP(expoPath);
        await cli.exec('npm', ['install', `expo-cli@${version}`], { cwd: expoPath });
        await cache.cacheDir(expoPath, TOOL, version);
    }

    return path.join(expoPath, 'node_modules', '.bin');
}

async function authenticate(username?: string, password?: string) {
    if (username && password) {
        await cli.exec('expo login', [`--username="${username}"`], {
            env: {
                ...process.env,
                EXPO_CLI_PASSWORD: password,
            },
        });
    }
}

async function run() {
    const version = await resolve(core.getInput('expo-version'));
    const expoPath = await install(version);

    core.addPath(expoPath);

    await authenticate(
        core.getInput('expo-username'),
        core.getInput('expo-password'),
    );
}

run();
