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

    return manifest.version;
}

async function installWithLockfile(version: string, manager: string, expoPath: string) {
    await io.cp(
        path.join(__dirname, '..', 'lockfiles', manager, version),
        path.join(expoPath),
    );

    switch (manager) {
        case 'npm': await cli.exec(await io.which(manager), ['ci'], { cwd: expoPath }); break;
        case 'yarn': await cli.exec(await io.which(manager), ['install', '--frozen-lock-file'], { cwd: expoPath }); break;
    }
}

async function install(version: string, manager: string) {
    let expoPath = cache.find(TOOL, version);

    if (!expoPath) {
        expoPath = process.env['RUNNER_TEMP'] || '';

        await io.mkdirP(expoPath);

        try {
            await installWithLockfile(version, manager, expoPath);
        } catch {
            await cli.exec(await io.which(manager), ['add', `expo-cli@${version}`], { cwd: expoPath });
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
    const version = await resolve(core.getInput('expo-version') || 'latest');
    const expoPath = await install(version, core.getInput('expo-manager') || 'npm');

    core.addPath(expoPath);

    await authenticate(
        core.getInput('expo-username'),
        core.getInput('expo-password'),
    );
}

run();
