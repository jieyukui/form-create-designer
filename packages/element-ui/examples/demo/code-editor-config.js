/** 代码编辑器自定义补全（演示用） */
export default {
    customCompletions: [
        {label: 'tableTool', type: 'class', detail: 'string', info: '表工具-顶层'},
    ],
    customObjectCompletions: {
        tableTool: {
            meta: {
                type: 'class',
                detail: 'tableTool',
                info: '获取表格数据方法合集',
                onWindow: false,
            },
            members: {
                getAssignTableData: {
                    meta: {
                        type: 'class',
                        detail: '(queryID, query, pageSize) => Object',
                        info: `
getAssignTableData(queryID, query, pageSize)
获取指定表格数据源

参数说明：
• queryID：数据源编号
• query：传递数据源的参数数据
• pageSize：返回数据条数
`,
                    },
                },
            },
        },
    },
    customObjects: {
        tableTool: {
            age: 234,
            getAssignTableData: (queryID, query, pageSize) => [
                {queryID, name: '数据源编号'},
                {query, name: '传递数据源的参数数据'},
                {pageSize, name: '返回数据条数'},
            ],
        },
    },
    customSignatures: {
        tableTool: {
            info: '表工具-覆盖',
        },
        'userInfo.userInfos': {
            info: '返回当前登录用户信息,含公司、用户、仓库等信息',
        },
        'userInfo.userInfos.locID': {
            info: '当前选择仓库编号',
        },
        'userInfo.userInfos.companyId': {
            info: '当前登录公司编号',
        },
        'userInfo.userInfos.userName': {
            info: '当前登录用户编号',
        },
        'userInfo.userInfos.userInfoObj.UserName': {
            info: '当前登录用户名称',
        },
    },
};
