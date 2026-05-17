/** Navigation API（window.navigation）补全项 */
export const navigationCompletions = [
  {label: 'back', type: 'function', detail: '(): void', info: '在历史记录中后退'},
  {label: 'forward', type: 'function', detail: '(): void', info: '在历史记录中前进'},
  {label: 'reload', type: 'function', detail: '(): void', info: '重新加载当前文档'},
  {
    label: 'traverseTo',
    type: 'function',
    detail: '(key: string) => Promise<void>',
    info: '导航到指定历史条目 key'
  },
  {label: 'canGoBack', type: 'property', detail: 'boolean', info: '是否可以后退'},
  {label: 'canGoForward', type: 'property', detail: 'boolean', info: '是否可以前进'},
  {label: 'currentEntry', type: 'property', detail: 'NavigationHistoryEntry | null', info: '当前历史条目'},
  {label: 'transition', type: 'property', detail: 'NavigationTransition | null', info: '当前导航过渡信息'},
  {label: 'activation', type: 'property', detail: 'NavigationActivation', info: '最近一次导航激活信息'},
  {
    label: 'entries',
    type: 'function',
    detail: '() => NavigationHistoryEntry[]',
    info: '获取当前同源历史条目列表'
  },
  {
    label: 'updateCurrentEntry',
    type: 'function',
    detail: '(options: NavigationUpdateCurrentEntryOptions) => void',
    info: '更新当前历史条目'
  },
  {label: 'addEventListener', type: 'function', detail: '(type: string, listener: EventListener) => void', info: '监听 navigate 等事件'},
  {label: 'removeEventListener', type: 'function', detail: '(type: string, listener: EventListener) => void', info: '移除事件监听'},
];
