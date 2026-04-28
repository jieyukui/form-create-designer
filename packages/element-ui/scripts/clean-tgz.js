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