#!/usr/bin/env node

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    blue: (str) => `\x1b[34m${str}\x1b[0m`
};

// 读取 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// 运行测试
const runTests = () => {
    if (packageJson.scripts?.test) {
        console.log(colors.gray('\n🧪 运行测试...'));
        try {
            execSync('npm test', {stdio: 'inherit'});
            console.log(colors.green('✅ 测试通过'));
        } catch (error) {
            console.log(colors.red('❌ 测试失败'));
            process.exit(1);
        }
    }
};

// 构建项目
const build = () => {
    if (packageJson.scripts?.build) {
        console.log(colors.gray('\n🔨 构建项目...'));
        try {
            execSync('npm run build', {stdio: 'inherit'});
            console.log(colors.green('✅ 构建成功'));
        } catch (error) {
            console.log(colors.red('❌ 构建失败'));
            process.exit(1);
        }
    }
};

// 打包
const pack = () => {
    console.log(colors.gray('\n📦 打包...'));
    try {
        const output = execSync('npm pack --json', {encoding: 'utf-8'});
        const result = JSON.parse(output);
        const tgzFile = result[0]?.filename;
        console.log(colors.green(`✅ 打包完成: ${tgzFile}`));
        return tgzFile;
    } catch (error) {
        console.log(colors.red('❌ 打包失败'));
        process.exit(1);
    }
};

// 发布
const publish = (tgzFile, versionType) => {
    console.log(colors.gray('\n🚀 发布到 NPM...'));

    // 更新版本
    let newVersion = packageJson.version;
    if (versionType) {
        try {
            execSync(`npm version ${versionType} --no-git-tag-version`, {stdio: 'pipe'});
            newVersion = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
            console.log(colors.green(`✅ 版本更新: ${newVersion}`));
        } catch (error) {
            console.log(colors.red('❌ 版本更新失败'));
            process.exit(1);
        }
    }

    // 重新打包（如果有版本更新）
    let finalTgz = tgzFile;
    if (versionType) {
        finalTgz = pack();
    }

    // 发布
    try {
        execSync(`npm publish "${finalTgz}" --access public`, {stdio: 'inherit'});
        console.log(colors.green('\n✅ 发布成功！'));
        console.log(colors.blue(`\n📦 ${packageJson.name}@${newVersion}`));
        console.log(colors.gray(`安装: npm install ${packageJson.name}`));

        // Git 提交
        if (versionType && !versionType.includes('pre')) {
            try {
                execSync('git add package.json', {stdio: 'pipe'});
                execSync(`git commit -m "chore(release): v${newVersion}"`, {stdio: 'pipe'});
                execSync(`git tag v${newVersion}`, {stdio: 'pipe'});
                console.log(colors.green('✅ Git 提交成功'));
            } catch (error) {
                console.log(colors.yellow('⚠️ Git 提交失败，请手动提交'));
            }
        }
    } catch (error) {
        console.log(colors.red('❌ 发布失败'));
        process.exit(1);
    }
};

// 主流程
const main = () => {
    const args = process.argv.slice(2);
    const versionType = args[0]; // patch, minor, major, beta

    console.log(colors.green('\n🚀 开始发布流程\n'));

    runTests();
    build();
    const tgzFile = pack();
    publish(tgzFile, versionType);
};

main();