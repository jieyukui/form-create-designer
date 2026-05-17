import {mathCompletions} from './math';
import {jsonCompletions} from './json';
import {consoleCompletions} from './console';
import {arrayCompletions} from './array';
import {objectCompletions} from './object';
import {stringCompletions} from './string';
import {numberCompletions} from './number';
import {dateCompletions} from './date';
import {symbolCompletions} from './symbol';
import {regexpCompletions} from './regexp';
import {promiseCompletions} from './promise';
import {bigintCompletions} from './bigint';
import {intlCompletions} from './intl';
import {reflectCompletions} from './reflect';
import {documentCompletions} from './document';
import {localStorageCompletions, sessionStorageCompletions} from './storage';
import {locationCompletions} from './location';
import {historyCompletions} from './history';
import {navigatorCompletions} from './navigator';
import {screenCompletions} from './screen';
import {cryptoCompletions} from './crypto';
import {performanceCompletions} from './performance';

/**
 * 内置对象补全数据
 *
 * 每个对象定义包含：
 * - completions: 补全项数组
 * - requires: 环境依赖特性（可选，默认总是可用）
 * - globalAlias: 全局变量名（同时也是 window 的属性名）
 */
export const builtinDataRegistry = {
    Math: {
        completions: mathCompletions,
        requires: [],
    },
    console: {
        completions: consoleCompletions,
        requires: [],
    },
    JSON: {
        completions: jsonCompletions,
        requires: [],
    },
    Array: {
        completions: arrayCompletions,
        requires: [],
    },
    Object: {
        completions: objectCompletions,
        requires: [],
    },
    String: {
        completions: stringCompletions,
        requires: [],
    },
    Number: {
        completions: numberCompletions,
        requires: [],
    },
    Boolean: {
        completions: [],
        requires: [],
    },
    Date: {
        completions: dateCompletions,
        requires: [],
    },
    RegExp: {
        completions: regexpCompletions,
        requires: [],
    },
    Promise: {
        completions: promiseCompletions,
        requires: [],
    },
    Map: {
        completions: [],
        requires: [],
    },
    Set: {
        completions: [],
        requires: [],
    },
    WeakMap: {
        completions: [],
        requires: [],
    },
    WeakSet: {
        completions: [],
        requires: [],
    },
    Symbol: {
        completions: symbolCompletions,
        requires: ['hasSymbol'],
    },
    BigInt: {
        completions: bigintCompletions,
        requires: ['hasBigInt'],
    },
    Intl: {
        completions: intlCompletions,
        requires: ['hasIntl'],
    },
    Proxy: {
        completions: [],
        requires: ['hasProxy'],
    },
    Reflect: {
        completions: reflectCompletions,
        requires: ['hasProxy'],
    },

    // ==================== DOM / window 对象 ====================
    document: {
        completions: documentCompletions,
        requires: ['hasDocument'],
    },
    localStorage: {
        completions: localStorageCompletions,
        requires: ['hasLocalStorage'],
    },
    sessionStorage: {
        completions: sessionStorageCompletions,
        requires: ['hasSessionStorage'],
    },
    location: {
        completions: locationCompletions,
        requires: ['hasWindow'],
    },
    history: {
        completions: historyCompletions,
        requires: ['hasWindow'],
    },
    navigator: {
        completions: navigatorCompletions,
        requires: ['hasNavigator'],
    },
    screen: {
        completions: screenCompletions,
        requires: ['hasWindow'],
    },
    crypto: {
        completions: cryptoCompletions,
        requires: ['hasCrypto'],
    },
    performance: {
        completions: performanceCompletions,
        requires: ['hasPerformance'],
    },
};

/**
 * 获取当前环境可用的内置对象数据
 * @param {Object} environment - 环境检测结果
 * @returns {Object} 过滤后的 registry
 */
export function getAvailableBuiltinData(environment) {
    const available = {};

    for (const [name, config] of Object.entries(builtinDataRegistry)) {
        if (!config.requires || config.requires.length === 0) {
            available[name] = config.completions;
        } else {
            const allMet = config.requires.every(req => {
                if (req.startsWith('has')) {
                    return environment[req] === true;
                }
                return true;
            });
            if (allMet) {
                available[name] = config.completions;
            }
        }
    }

    return available;
}

export {
    mergeBuiltinWithCustomObjects,
    normalizeCustomObjectCompletions,
    resolveCustomObjectCompletions
} from '../../utils/custom-object-completions';
