#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const colors = {
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    blue: (str) => `\x1b[34m${str}\x1b[0m`,
    gray: (str) => `\x1b[90m${str}\x1b[0m`
};

const ENV_FILE = '.env.npm';
const NPMRC_FILE = '.npmrc';

// 从 .env 文件读取 token
const loadTokenFromEnv = () => {
    try {
        if (fs.existsSync(ENV_FILE)) {
            const content = fs.readFileSync(ENV_FILE, 'utf-8');
            const match = content.match(/NPM_TOKEN=([^\n]+)/);
            if (match) {
                return match[1].trim();
            }
        }
    } catch (error) {
        return null;
    }
    return null;
};

// 保存 token 到 .env 文件
const saveTokenToEnv = (token) => {
    const envContent = `# NPM Token
NPM_TOKEN=${token}
# 生成时间: ${new Date().toISOString()}
`;
    fs.writeFileSync(ENV_FILE, envContent, 'utf-8');
    console.log(colors.green(`✅ Token 已保存到 ${ENV_FILE}`));
};

// 配置 npm token
const configNpmToken = (token, isLocal = true) => {
    const configCmd = `npm config set ${isLocal ? '' : '--global'} //registry.npmjs.org/:_authToken ${token}`;
    try {
        execSync(configCmd, {stdio: 'pipe'});
        return true;
    } catch (error) {
        return false;
    }
};

// 从 .npmrc 读取配置
const getNpmrcToken = () => {
    try {
        const result = execSync('npm config get //registry.npmjs.org/:_authToken', {
            encoding: 'utf-8',
            stdio: 'pipe'
        }).trim();
        return result || null;
    } catch {
        return null;
    }
};

// 验证 token
const validateToken = async (token) => {
    // 临时设置 token
    const originalToken = getNpmrcToken();
    configNpmToken(token, true);

    try {
        const username = execSync('npm whoami --registry=https://registry.npmjs.org/', {
            encoding: 'utf-8',
            stdio: 'pipe'
        }).trim();

        // 恢复原 token
        if (originalToken) {
            configNpmToken(originalToken, true);
        } else {
            execSync('npm config delete //registry.npmjs.org/:_authToken', {stdio: 'pipe'});
        }

        return username;
    } catch (error) {
        // 恢复原 token
        if (originalToken) {
            configNpmToken(originalToken, true);
        }
        return null;
    }
};

// 交互式设置
const interactiveSetup = async () => {
    console.log(colors.green('\n🔧 NPM Token 交互式设置\n'));

    // 1. 读取已有 token
    let token = loadTokenFromEnv() || getNpmrcToken();

    if (token) {
        console.log(colors.yellow('⚠️  检测到已有 Token'));
        const useExisting = await question(colors.yellow('是否使用现有 Token？(y/n): '));
        if (useExisting.toLowerCase() === 'y') {
            console.log(colors.gray('使用现有 Token'));
        } else {
            token = await question(colors.yellow('请输入新 Token: '));
        }
    } else {
        token = await question(colors.yellow('请输入 NPM Token: '));
    }

    if (!token) {
        console.log(colors.red('❌ Token 不能为空'));
        process.exit(1);
    }

    // 2. 验证 Token
    console.log(colors.gray('\n⏳ 验证 Token...'));
    const username = await validateToken(token);

    if (!username) {
        console.log(colors.red('❌ Token 无效，请检查'));
        const retry = await question(colors.yellow('是否重新输入？(y/n): '));
        if (retry.toLowerCase() === 'y') {
            await interactiveSetup();
        }
        process.exit(1);
    }

    console.log(colors.green(`✅ Token 有效，用户: ${username}`));

    // 3. 选择配置方式
    console.log(colors.gray('\n📁 选择配置方式:'));
    console.log('  1) 项目级别（推荐）- 仅当前项目');
    console.log('  2) 全局级别 - 所有项目');
    console.log('  3) 仅保存到 .env 文件');

    const choice = await question(colors.yellow('请选择 (1-3): '));

    // 4. 执行配置
    if (choice === '1') {
        if (configNpmToken(token, true)) {
            console.log(colors.green('✅ 项目级别配置成功'));
            console.log(colors.gray(`配置文件: ${path.join(process.cwd(), NPMRC_FILE)}`));
        } else {
            console.log(colors.red('❌ 配置失败'));
        }
    } else if (choice === '2') {
        if (configNpmToken(token, false)) {
            console.log(colors.green('✅ 全局级别配置成功'));
        } else {
            console.log(colors.red('❌ 配置失败'));
        }
    } else if (choice === '3') {
        saveTokenToEnv(token);
    }

    // 5. 保存到 .env 备份（可选）
    const saveBackup = await question(colors.yellow('\n是否同时保存到 .env 文件备份？(y/n): '));
    if (saveBackup.toLowerCase() === 'y') {
        saveTokenToEnv(token);
    }

    console.log(colors.green('\n🎉 配置完成！'));
};

// 清理配置
const cleanup = async () => {
    console.log(colors.yellow('\n🧹 清理 NPM Token 配置\n'));

    const hasLocal = getNpmrcToken();
    const hasEnv = loadTokenFromEnv();

    if (hasLocal) {
        console.log(colors.gray('检测到项目级别配置'));
        const delLocal = await question(colors.yellow('删除项目级别配置？(y/n): '));
        if (delLocal.toLowerCase() === 'y') {
            execSync('npm config delete //registry.npmjs.org/:_authToken', {stdio: 'pipe'});
            console.log(colors.green('✅ 已删除项目级别配置'));
        }
    }

    if (hasEnv) {
        console.log(colors.gray(`检测到 ${ENV_FILE} 文件`));
        const delEnv = await question(colors.yellow(`删除 ${ENV_FILE} 文件？(y/n): `));
        if (delEnv.toLowerCase() === 'y') {
            fs.unlinkSync(ENV_FILE);
            console.log(colors.green(`✅ 已删除 ${ENV_FILE}`));
        }
    }

    console.log(colors.green('\n✨ 清理完成'));
};

// 显示当前配置状态
const showStatus = () => {
    console.log(colors.green('\n📊 NPM Token 配置状态\n'));

    const localToken = getNpmrcToken();
    const envToken = loadTokenFromEnv();

    if (localToken) {
        const masked = localToken.slice(0, 8) + '...' + localToken.slice(-8);
        console.log(colors.green(`✅ 项目级别: ${masked}`));
    } else {
        console.log(colors.yellow('❌ 项目级别: 未配置'));
    }

    if (envToken) {
        const masked = envToken.slice(0, 8) + '...' + envToken.slice(-8);
        console.log(colors.green(`✅ .env 备份: ${masked}`));
    } else {
        console.log(colors.yellow('❌ .env 备份: 未配置'));
    }

    // 测试当前配置
    console.log(colors.gray('\n⏳ 测试当前配置...'));
    try {
        const username = execSync('npm whoami --registry=https://registry.npmjs.org/', {
            encoding: 'utf-8',
            stdio: 'pipe'
        }).trim();
        console.log(colors.green(`✅ 配置有效，当前用户: ${username}`));
    } catch (error) {
        console.log(colors.red('❌ 当前配置无效或未登录'));
    }

    console.log('');
};

// 命令行入口
const main = () => {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
    case 'setup':
        interactiveSetup().finally(() => rl.close());
        break;
    case 'clean':
        cleanup().finally(() => rl.close());
        break;
    case 'status':
        showStatus();
        rl.close();
        break;
    case 'help':
    default:
        console.log(`
${colors.green('NPM Token 管理工具')}

${colors.yellow('用法:')}
  npm run token:setup      # 交互式配置 Token
  npm run token:status     # 查看当前配置状态
  npm run token:clean      # 清理所有 Token 配置

${colors.yellow('说明:')}
  - setup: 引导你完成 Token 配置，支持验证和多种配置方式
  - status: 查看当前配置状态并测试有效性
  - clean: 删除所有相关的 Token 配置
      `);
        rl.close();
    }
};

main();