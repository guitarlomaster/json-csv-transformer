const fs = require('fs'),
    sh = require('shelljs');

removeDist();
startWritingCsv();

function removeDist() {
    if (fs.existsSync(__dirname + '/dist')) {
        sh.rm('-rf', __dirname + '/dist');
        sh.mkdir('-p', __dirname + '/dist/csv');
    } else {
        sh.mkdir('-p', __dirname + '/dist/csv');
    }
}

function startWritingCsv() {
    let title_str = 'key';
    fs.readdirSync(__dirname + '/source/json/').forEach(fileName => {
        const fileArr = fileName.split('.');
        title_str += `,${fileArr[0]}`;
    });

    let stream = fs.createWriteStream(__dirname + '/dist/csv/translations.csv');
    stream.once('open', function () {
        stream.write(title_str + '\n');
        getStr(function (item) {
            stream.write(item + '\n');
        });
    });
}

function getStr(cb) {
    const langLinesObj = {};
    fs.readdirSync(__dirname + '/source/json/').forEach(fileName => {
        const langLinesArr = [];
        const locale = fileName.split('.json')[0];
        const file = fs.readFileSync(`./source/json/${fileName}`);
        const json = JSON.parse(file);
        for (let key1 in json) {
            if (typeof json[key1] === 'object') {
                for (let key2 in json[key1]) {
                    langLinesArr.push(`${key1}.${key2},"${json[key1][key2]}"`);
                }
            }
        }
        langLinesObj[locale] = langLinesArr;
    });
    const resultLinesArr = [];
    const langKeys = Object.keys(langLinesObj);
    for(let i = 0; i < langKeys.length; i++) {
        const key = langKeys[i];
        if (i === 0) {
            resultLinesArr.push(...langLinesObj[key]);
        } else {
            for(let i1 = 0; i1 < resultLinesArr.length; i1++) {
                const str = langLinesObj[key][i1].split('"')[1];
                resultLinesArr[i1] += `,"${str}"`
            }
        }
    }
    for(let item of resultLinesArr) {
        cb(item);
    }
}
