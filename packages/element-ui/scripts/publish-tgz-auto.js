#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const colors = {
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    blue: (str) => `\x1b[34m${str}\x1b[0m`
};

// 获取命令行参数
const args = process.argv.slice(2);
const tag = args.find(arg => arg.startsWith('--tag='))?.split('=')[1] || 'latest';
const tgzFile = args.find(arg => !arg.startsWith('--')) || null;

// 查找最新的 tgz 文件
const findLatestTgz = () => {
    const files = fs.readdirSync(process.cwd())
        .filter(f => f.endsWith('.tgz'))
        .map(f => ({
            name: f,
            mtime: fs.statSync(f).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    return files[0]?.name;
};

// 获取包信息
const getPackageInfo = (tgzFile) => {
    try {
        const output = execSync(`tar -xzf "${tgzFile}" -O package/package.json`, {
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return JSON.parse(output);
    } catch (error) {
        return null;
    }
};

// 主流程
const main = () => {
    console.log(colors.green('\n📦 自动发布 TGZ 到 NPM\n'));

    // 确定要发布的文件
    let targetFile = tgzFile;
    if (!targetFile || !fs.existsSync(targetFile)) {
        targetFile = findLatestTgz();
        if (!targetFile) {
            console.log(colors.red('❌ 没有找到 .tgz 文件'));
            console.log(colors.yellow('💡 请先运行: npm pack'));
            process.exit(1);
        }
        console.log(colors.yellow(`📄 使用文件: ${targetFile}`));
    }

    // 获取包信息
    const pkgInfo = getPackageInfo(targetFile);
    if (!pkgInfo) {
        console.log(colors.red('❌ 无法读取包信息'));
        process.exit(1);
    }

    console.log(colors.green(`📦 ${pkgInfo.name}@${pkgInfo.version}`));

    // 检查登录
    try {
        execSync('npm whoami', {stdio: 'ignore'});
    } catch (error) {
        console.log(colors.red('❌ 未登录 NPM，请运行: npm login'));
        process.exit(1);
    }

    // 发布
    console.log(colors.gray(`🚀 发布中... (tag: ${tag})`));
    try {
        let cmd = `npm publish "${targetFile}" --access public`;
        if (tag !== 'latest') {
            cmd += ` --tag ${tag}`;
        }
        execSync(cmd, {stdio: 'inherit'});
        console.log(colors.green('\n✅ 发布成功！'));
    } catch (error) {
        console.log(colors.red('\n❌ 发布失败'));
        process.exit(1);
    }
};

main();