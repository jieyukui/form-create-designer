#!/usr/bin/env node
/**
 * 将最新 npm pack 产物解压到 node_modules，供 examples 发版前验证。
 * 不经过 npm install，避免 monorepo / pnpm 根目录 postinstall 失败。
 */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
const distEntry = path.join(root, 'dist/index.es.js');

const colors = {
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    gray: (s) => `\x1b[90m${s}\x1b[0m`,
};

function findLatestTgz() {
    const files = fs.readdirSync(root)
        .filter((f) => f.endsWith('.tgz'))
        .map((f) => {
            const full = path.join(root, f);
            return {name: f, full, mtime: fs.statSync(full).mtime};
        })
        .sort((a, b) => b.mtime - a.mtime);
    return files[0] || null;
}

function rmrf(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, {recursive: true, force: true});
    }
}

function ensurePack() {
    if (!fs.existsSync(distEntry)) {
        console.error(colors.red('未找到 dist/index.es.js，请先执行: npm run build'));
        process.exit(1);
    }

    const distMtime = fs.statSync(distEntry).mtime;
    const latest = findLatestTgz();

    if (!latest || distMtime > latest.mtime) {
        console.log(colors.yellow('正在打包（dist 已更新或缺少 tgz）...'));
        execSync('npm run pack', {cwd: root, stdio: 'inherit'});
    }

    return findLatestTgz();
}

function main() {
    const tgzInfo = ensurePack();
    if (!tgzInfo) {
        console.error(colors.red('打包失败，未生成 .tgz'));
        process.exit(1);
    }

    const tgzPath = tgzInfo.full;
    const tmpDir = path.join(root, '.verify-tmp');
    const parts = pkg.name.split('/');
    const scope = parts.length > 1 ? parts[0] : null;
    const shortName = parts.length > 1 ? parts[1] : parts[0];
    const modulesRoot = path.join(root, 'node_modules');
    const targetDir = scope
        ? path.join(modulesRoot, scope, shortName)
        : path.join(modulesRoot, shortName);

    console.log(colors.gray(`解压验证包: ${tgzInfo.name}`));

    rmrf(tmpDir);
    fs.mkdirSync(tmpDir, {recursive: true});

    execSync(`tar -xzf "${tgzPath}" -C "${tmpDir}"`, {stdio: 'inherit'});

    const extracted = path.join(tmpDir, 'package');
    if (!fs.existsSync(extracted)) {
        console.error(colors.red('tgz 内未找到 package 目录'));
        rmrf(tmpDir);
        process.exit(1);
    }

    const packedDist = path.join(extracted, 'dist/index.es.js');
    if (!fs.existsSync(packedDist)) {
        console.error(colors.red('tgz 内缺少 dist/index.es.js，请确认 package.json files 包含 dist 后重新 pack'));
        rmrf(tmpDir);
        process.exit(1);
    }

    if (scope) {
        fs.mkdirSync(path.join(modulesRoot, scope), {recursive: true});
    }
    rmrf(targetDir);
    fs.renameSync(extracted, targetDir);
    rmrf(tmpDir);

    const installedPkg = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf-8'));
    console.log(colors.green(`\n✅ 已安装到 node_modules/${pkg.name}@${installedPkg.version}`));
    console.log(colors.gray(`   路径: ${targetDir}`));
    console.log(colors.gray('下一步: npm run dev:verify\n'));
}

main();
