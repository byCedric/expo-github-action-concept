import * as core from '@actions/core';
import * as cli from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/tool-cache';
import * as path from 'path';

const npm = require('libnpm');
const TOOL = 'expo-cli-test';

async function resolve(version: string) {
    const manifest = await npm.manifest(`expo-cli@${version}`);

    if (!manifest.version) {
        throw new Error(`Could not find expo-cli version "${version}"`);
    }

    return manifest.version
}

async function install(version: string, manager: string = 'npm') {
    let expoPath = cache.find(TOOL, version);

    const managers = await Promise.all([
        io.which('yarn'),
        io.which('npm'),
    ]);

    console.log(managers);

    if (!expoPath) {
        expoPath = process.env['RUNNER_TEMP'] || '';

        await io.mkdirP(expoPath);

        switch (manager) {
            case 'npm':
                await cli.exec('npm', ['install', `expo-cli@${version}`], { cwd: expoPath });
            break;
            case 'yarn':
                await cli.exec('yarn', ['add', `expo-cli@${version}`], { cwd: expoPath });
            break;
            default:
                throw new Error(`Unknown manager "${manager}"`);
        }

        expoPath = await cache.cacheDir(expoPath, TOOL, version);
    }

    return path.join(expoPath, 'node_modules', '.bin');
}

async function authenticate(username?: string, password?: string) {
    if (username && password) {
        await cli.exec('expo', ['login', `--username=${username}`], {
            env: {
                ...process.env,
                EXPO_CLI_PASSWORD: password,
            },
        });
    }
}

async function run() {
    const version = await resolve(core.getInput('expo-version'));
    const expoPath = await install(version, core.getInput('expo-manager'));

    core.addPath(expoPath);

    await authenticate(
        core.getInput('expo-username'),
        core.getInput('expo-password'),
    );
}

run();
