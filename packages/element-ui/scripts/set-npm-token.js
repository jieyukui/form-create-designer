#!/usr/bin/env node

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    blue: (str) => `\x1b[34m${str}\x1b[0m`,
    gray: (str) => `\x1b[90m${str}\x1b[0m`
};

// 获取当前配置的 token
const getCurrentToken = () => {
    try {
        const result = execSync('npm config get //registry.npmjs.org/:_authToken', {encoding: 'utf-8'}).trim();
        return result || null;
    } catch (error) {
        return null;
    }
};

// 设置 token
const setToken = (token, isGlobal = false) => {
    const cmd = `npm config set ${isGlobal ? '--global' : ''} //registry.npmjs.org/:_authToken ${token}`;
    try {
        execSync(cmd, {stdio: 'pipe'});
        return true;
    } catch (error) {
        return false;
    }
};

// 删除 token
const removeToken = (isGlobal = false) => {
    const cmd = `npm config delete ${isGlobal ? '--global' : ''} //registry.npmjs.org/:_authToken`;
    try {
        execSync(cmd, {stdio: 'pipe'});
        return true;
    } catch (error) {
        return false;
    }
};

// 测试 token 是否有效
const testToken = () => {
    try {
        const result = execSync('npm whoami --registry=https://registry.npmjs.org/', {
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return result.trim();
    } catch (error) {
        return null;
    }
};

// 显示帮助信息
const showHelp = () => {
    console.log(`
${colors.green('NPM Token 管理工具')}

${colors.yellow('用法:')}
  npm run token:set        # 设置 token（项目级别）
  npm run token:set:global # 设置 token（全局级别）
  npm run token:show       # 显示当前 token（隐藏部分内容）
  npm run token:test       # 测试 token 是否有效
  npm run token:remove     # 删除 token
  npm run token:remove:global # 删除全局 token

${colors.yellow('说明:')}
  - 项目级别：token 保存在当前项目的 .npmrc 文件中
  - 全局级别：token 保存在用户目录的 .npmrc 文件中
  - 推荐使用项目级别，避免影响其他项目
  `);
};

// 主流程
const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];

    // 显示帮助
    if (command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        rl.close();
        return;
    }

    // 设置 token
    if (command === 'set' || command === 'set:global') {
        const isGlobal = command === 'set:global';
        const currentToken = getCurrentToken();

        if (currentToken) {
            console.log(colors.yellow(`⚠️  当前已设置 token（${isGlobal ? '全局' : '项目'}级别）`));
            const overwrite = await question(colors.yellow('是否覆盖？(y/n): '));
            if (overwrite.toLowerCase() !== 'y') {
                console.log(colors.yellow('已取消'));
                rl.close();
                return;
            }
        }

        let token = args[1];
        if (!token) {
            token = await question(colors.yellow('请输入你的 NPM Token: '));
            if (!token) {
                console.log(colors.red('❌ Token 不能为空'));
                rl.close();
                process.exit(1);
            }
        }

        console.log(colors.gray('\n⏳ 设置中...'));
        const success = setToken(token, isGlobal);

        if (success) {
            console.log(colors.green(`\n✅ Token 已设置${isGlobal ? '（全局）' : '（项目）'}`));
            console.log(colors.gray(`配置文件: ${isGlobal ? '~/.npmrc' : './.npmrc'}`));

            // 询问是否测试
            const test = await question(colors.yellow('\n是否测试 Token 有效性？(y/n): '));
            if (test.toLowerCase() === 'y') {
                const username = testToken();
                if (username) {
                    console.log(colors.green(`✅ Token 有效，当前用户: ${username}`));
                } else {
                    console.log(colors.red('❌ Token 无效，请检查是否正确'));
                }
            }
        } else {
            console.log(colors.red('❌ 设置失败'));
        }
        rl.close();
        return;
    }

    // 显示 token
    if (command === 'show') {
        const token = getCurrentToken();
        if (token) {
            const masked = token.slice(0, 8) + '...' + token.slice(-8);
            console.log(colors.green(`当前 Token: ${masked}`));
            console.log(colors.gray(`完整长度: ${token.length} 字符`));
        } else {
            console.log(colors.yellow('未设置 Token'));
        }
        rl.close();
        return;
    }

    // 测试 token
    if (command === 'test') {
        console.log(colors.gray('⏳ 测试中...'));
        const username = testToken();
        if (username) {
            console.log(colors.green(`✅ Token 有效，当前用户: ${username}`));
        } else {
            console.log(colors.red('❌ Token 无效或未设置'));
        }
        rl.close();
        return;
    }

    // 删除 token
    if (command === 'remove' || command === 'remove:global') {
        const isGlobal = command === 'remove:global';
        const confirm = await question(colors.red(`确认删除${isGlobal ? '全局' : '项目'} Token？(yes/no): `));

        if (confirm.toLowerCase() === 'yes') {
            const success = removeToken(isGlobal);
            if (success) {
                console.log(colors.green(`✅ Token 已删除${isGlobal ? '（全局）' : '（项目）'}`));
            } else {
                console.log(colors.red('❌ 删除失败'));
            }
        } else {
            console.log(colors.yellow('已取消'));
        }
        rl.close();
        return;
    }

    // 默认显示帮助
    showHelp();
    rl.close();
};

main().catch(console.error);