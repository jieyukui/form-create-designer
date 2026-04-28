#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const readline = require('readline');

// 创建交互式命令行接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise 化的提问函数
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

// 颜色输出
const colors = {
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    blue: (str) => `\x1b[34m${str}\x1b[0m`,
    gray: (str) => `\x1b[90m${str}\x1b[0m`
};

// 执行命令并返回结果
const exec = (command, options = {}) => {
    try {
        return execSync(command, {
            encoding: 'utf-8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
    } catch (error) {
        if (!options.ignoreError) {
            console.error(colors.red(`❌ 命令执行失败: ${command}`));
            throw error;
        }
        return null;
    }
};

// 获取最新的 tgz 文件
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

// 获取 tgz 包的信息
const getTgzInfo = (tgzFile) => {
    try {
        // 解压并读取 package.json
        const cmd = `tar -xzf "${tgzFile}" -O package/package.json 2>nul`;
        const result = exec(cmd, {silent: true, encoding: 'buffer'});

        if (result && result.toString) {
            const packageJson = JSON.parse(result.toString());
            return {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description
            };
        }
    } catch (error) {
        // Windows 兼容处理
        try {
            const {execSync} = require('child_process');
            const output = execSync(`tar -xzf "${tgzFile}" -O package/package.json`, {
                encoding: 'utf-8',
                stdio: 'pipe'
            });
            const packageJson = JSON.parse(output);
            return {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description
            };
        } catch (e) {
            return null;
        }
    }
    return null;
};

// 检查 NPM 登录状态
const checkNpmLogin = () => {
    try {
        const whoami = exec('npm whoami', {silent: true});
        console.log(colors.green(`✅ 已登录 NPM: ${whoami.trim()}`));
        return true;
    } catch (error) {
        console.log(colors.red('❌ 未登录 NPM'));
        return false;
    }
};

// 发布 tgz 文件
const publishTgz = (tgzFile, tag, isPublic = true) => {
    let command = `npm publish "${tgzFile}"`;

    if (tag && tag !== 'latest') {
        command += ` --tag ${tag}`;
    }

    if (isPublic) {
        command += ' --access public';
    }

    console.log(colors.gray(`\n执行命令: ${command}\n`));

    try {
        exec(command);
        return true;
    } catch (error) {
        return false;
    }
};

// 主流程
const main = async () => {
    console.log(colors.green('\n📦 NPM TGZ 发布工具\n'));

    // 1. 查找 tgz 文件
    let tgzFile = process.argv[2]; // 支持命令行参数指定文件

    if (!tgzFile || !fs.existsSync(tgzFile)) {
        tgzFile = findLatestTgz();

        if (!tgzFile) {
            console.log(colors.red('❌ 没有找到 .tgz 文件'));
            console.log(colors.yellow('💡 请先运行: npm pack\n'));
            process.exit(1);
        }

        console.log(colors.yellow(`📄 找到文件: ${tgzFile}`));
        const useThis = await question(colors.yellow('是否使用这个文件？(y/n): '));

        if (useThis.toLowerCase() !== 'y') {
            const manual = await question(colors.yellow('请输入文件名: '));
            if (!manual || !fs.existsSync(manual)) {
                console.log(colors.red('❌ 文件不存在'));
                process.exit(1);
            }
            tgzFile = manual;
        }
    }

    // 2. 获取包信息
    console.log(colors.gray('\n📋 读取包信息...'));
    const pkgInfo = getTgzInfo(tgzFile);

    if (!pkgInfo) {
        console.log(colors.red('❌ 无法读取包信息，请确保文件有效'));
        process.exit(1);
    }

    console.log(colors.green(`\n📦 包名: ${pkgInfo.name}`));
    console.log(colors.green(`🔢 版本: ${pkgInfo.version}`));
    if (pkgInfo.description) {
        console.log(colors.gray(`📝 描述: ${pkgInfo.description}`));
    }

    // 3. 检查登录状态
    console.log(colors.gray('\n🔐 检查登录状态...'));
    if (!checkNpmLogin()) {
        console.log(colors.yellow('\n💡 请先登录: npm login\n'));
        process.exit(1);
    }

    // 4. 选择发布 tag
    console.log(colors.gray('\n🏷️  选择发布标签:'));
    console.log('  1) latest (默认/稳定版)');
    console.log('  2) beta (测试版)');
    console.log('  3) alpha (内部测试版)');
    console.log('  4) 自定义');
    console.log('  5) 跳过（不指定 tag）');

    const tagChoice = await question(colors.yellow('\n请选择 (1-5): '));
    let tag = 'latest';

    switch (tagChoice) {
    case '2':
        tag = 'beta';
        break;
    case '3':
        tag = 'alpha';
        break;
    case '4':
        tag = await question(colors.yellow('输入自定义 tag: '));
        if (!tag) tag = '';
        break;
    case '5':
        tag = '';
        break;
    default:
        tag = 'latest';
    }

    // 5. 确认发布
    console.log(colors.gray('\n⚠️  发布确认:'));
    console.log(`  文件: ${tgzFile}`);
    console.log(`  包名: ${pkgInfo.name}`);
    console.log(`  版本: ${pkgInfo.version}`);
    console.log(`  标签: ${tag || '无'}`);

    const confirm = await question(colors.yellow('\n确认发布到 NPM？(y/n): '));

    if (confirm.toLowerCase() !== 'y') {
        console.log(colors.yellow('❌ 已取消发布'));
        rl.close();
        process.exit(0);
    }

    // 6. 执行发布
    console.log(colors.gray('\n🚀 发布中...'));
    const isPublic = !pkgInfo.name.startsWith('@') || pkgInfo.name.includes('/');
    const success = publishTgz(tgzFile, tag, isPublic);

    if (success) {
        console.log(colors.green('\n✅ 发布成功！\n'));
        console.log(colors.gray('安装命令:'));
        if (tag && tag !== 'latest') {
            console.log(colors.blue(`  npm install ${pkgInfo.name}@${tag}`));
        } else {
            console.log(colors.blue(`  npm install ${pkgInfo.name}`));
        }
        console.log(colors.blue(`  npm install ${pkgInfo.name}@${pkgInfo.version}\n`));
    } else {
        console.log(colors.red('\n❌ 发布失败，请检查错误信息\n'));
        process.exit(1);
    }

    rl.close();
};

// 处理 Ctrl+C
process.on('SIGINT', () => {
    console.log(colors.yellow('\n\n❌ 已取消操作'));
    rl.close();
    process.exit(0);
});

// 运行
if (require.main === module) {
    main().catch(error => {
        console.error(colors.red(`\n❌ 错误: ${error.message}`));
        rl.close();
        process.exit(1);
    });
}

module.exports = {publishTgz, getTgzInfo, findLatestTgz};