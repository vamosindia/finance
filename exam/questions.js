const questionBank = [
    {
        title: "HTML是什么？",
        options: [
            "编程语言",
            "标记语言",
            "数据库",
            "操作系统"
        ],
        answer: 1
    },
    {
        title: "CSS的作用是？",
        options: [
            "存数据",
            "控制样式",
            "连接数据库",
            "编译代码"
        ],
        answer: 1
    },
    {
        title: "JavaScript运行在？",
        options: [
            "浏览器",
            "打印机",
            "显示器",
            "路由器"
        ],
        answer: 0
    }
];

// 自动生成测试题
for(let i = 4; i <= 100; i++){
    questionBank.push({
        title: `测试题 ${i}`,
        options: ["A","B","C","D"],
        answer: Math.floor(Math.random() * 4)
    });
}
