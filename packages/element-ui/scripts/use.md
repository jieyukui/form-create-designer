好的，我来给你写一个纯 JS/NPM 脚本，避免 shell 脚本弹窗关闭的问题。

## 1. 完整的 Node.js 发布脚本

### scripts/publish-tgz.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
    const result = exec(cmd, { silent: true, encoding: 'buffer' });
    
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
      const { execSync } = require('child_process');
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
    const whoami = exec('npm whoami', { silent: true });
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
    command += ` --access public`;
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
  
  const confirm = await question(colors.yellow('\n确认发布到 NPM？(yes/no): '));
  
  if (confirm.toLowerCase() !== 'yes') {
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

module.exports = { publishTgz, getTgzInfo, findLatestTgz };
```

## 2. 添加到 package.json

```json
{
  "scripts": {
    "pack": "npm pack",
    "pack:dry": "npm pack --dry-run",
    "publish:tgz": "node scripts/publish-tgz.js",
    "publish:tgz:auto": "node scripts/publish-tgz-auto.js",
    "release": "npm run pack && npm run publish:tgz"
  }
}
```

## 3. 自动化脚本（无交互）

### scripts/publish-tgz-auto.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    execSync('npm whoami', { stdio: 'ignore' });
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
    execSync(cmd, { stdio: 'inherit' });
    console.log(colors.green('\n✅ 发布成功！'));
  } catch (error) {
    console.log(colors.red('\n❌ 发布失败'));
    process.exit(1);
  }
};

main();
```

## 4. 一键发布脚本（打包+发布）

### scripts/release.js
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
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
      execSync('npm test', { stdio: 'inherit' });
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
      execSync('npm run build', { stdio: 'inherit' });
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
    const output = execSync('npm pack --json', { encoding: 'utf-8' });
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
      execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'pipe' });
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
    execSync(`npm publish "${finalTgz}" --access public`, { stdio: 'inherit' });
    console.log(colors.green('\n✅ 发布成功！'));
    console.log(colors.blue(`\n📦 ${packageJson.name}@${newVersion}`));
    console.log(colors.gray(`安装: npm install ${packageJson.name}`));
    
    // Git 提交
    if (versionType && !versionType.includes('pre')) {
      try {
        execSync(`git add package.json`, { stdio: 'pipe' });
        execSync(`git commit -m "chore(release): v${newVersion}"`, { stdio: 'pipe' });
        execSync(`git tag v${newVersion}`, { stdio: 'pipe' });
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
```

## 5. 使用方式

```bash
# 1. 先打包生成 tgz
npm run pack

# 2. 交互式发布（推荐）
npm run publish:tgz

# 3. 自动发布（使用最新 tgz）
npm run publish:tgz:auto

# 4. 指定文件发布
npm run publish:tgz:auto my-package-1.0.0.tgz

# 5. 指定 tag 发布
npm run publish:tgz:auto -- --tag=beta

# 6. 一键发布（打包+测试+构建+发布）
npm run release

# 7. 一键发布并升级版本
npm run release -- patch   # 修订版本
npm run release -- minor   # 次版本
npm run release -- major   # 主版本
npm run release -- beta     # Beta 版本
```

## 6. 额外工具脚本

### scripts/clean-tgz.js (清理旧文件)
```javascript
const fs = require('fs');
const path = require('path');

const tgzFiles = fs.readdirSync(process.cwd())
  .filter(f => f.endsWith('.tgz'));

if (tgzFiles.length === 0) {
  console.log('没有找到 .tgz 文件');
  process.exit(0);
}

console.log(`找到 ${tgzFiles.length} 个文件:`);
tgzFiles.forEach(f => console.log(`  - ${f}`));

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('确认删除所有 .tgz 文件？(yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    tgzFiles.forEach(f => {
      fs.unlinkSync(f);
      console.log(`✅ 已删除: ${f}`);
    });
    console.log('清理完成！');
  } else {
    console.log('已取消');
  }
  rl.close();
});
```

添加命令：
```json
{
  "scripts": {
    "clean:tgz": "node scripts/clean-tgz.js"
  }
}
```

这样你就有了完整的纯 JavaScript 解决方案，不会再有弹窗闪退的问题！