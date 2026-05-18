const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

function isVerifyMode() {
    if (process.env.VUE_APP_VERIFY === 'true') {
        return true;
    }
    const modeIdx = process.argv.indexOf('--mode');
    if (modeIdx !== -1 && process.argv[modeIdx + 1] === 'verify') {
        return true;
    }
    const script = process.env.npm_lifecycle_event || '';
    return script === 'dev:verify' || script === 'verify:dev';
}

function getDevAliases() {
    return {
        '@fc-designer-entry': path.resolve(__dirname, 'src/index.js'),
        '@fc-locale': path.resolve(__dirname, 'src/locale'),
    };
}

function getVerifyAliases() {
    let packageRoot;
    try {
        packageRoot = path.dirname(require.resolve(`${pkg.name}/package.json`));
    } catch (e) {
        throw new Error(
            `[dev:verify] 未找到 ${pkg.name}，请先执行：npm run verify:install\n` +
            '（需先 npm run build && npm run pack）'
        );
    }
    const entry = path.join(packageRoot, 'dist/index.es.js');
    if (!fs.existsSync(entry)) {
        throw new Error(
            `[dev:verify] 安装包中缺少 ${entry}，请重新 build 并 verify:install`
        );
    }
    return {
        '@fc-designer-entry': entry,
        '@fc-locale': path.join(packageRoot, 'src/locale'),
    };
}

function createConfig(isVerify) {
    return {
        pages: {
            app: {
                entry: 'examples/main.js',
                template: 'examples/index.html',
                filename: 'index.html',
                title: isVerify
                    ? `[验证] ${pkg.name}@${pkg.version} - FcDesigner`
                    : 'FcDesigner 本地演示',
            },
        },
        transpileDependencies: ['marked'],
        configureWebpack: {
            resolve: {
                alias: isVerify ? getVerifyAliases() : getDevAliases(),
            },
            module: {
                rules: [
                    {
                        test: /\.mjs$/,
                        include: /node_modules/,
                        type: 'javascript/auto',
                    },
                ],
            },
        },
    };
}

// Vue CLI 4 可能无参调用，需兼容 options 为空
module.exports = (options = {}) => {
    const isVerify = options.mode === 'verify' || isVerifyMode();
    return createConfig(isVerify);
};
