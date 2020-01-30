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
    stream.once('open', () => {
        stream.write(title_str + '\n');
        getStr((item) => {
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
    let resultLinesArr = [];
    const langKeys = Object.keys(langLinesObj);
    for(let i = 0; i < langKeys.length; i++) {
        const locale = langKeys[i];
        if (i === 0) {
            for(let item of langLinesObj[locale]) {
                let resultStr = '';
                const strArr = item.split('"');
                if (strArr.length > 3) {
                    resultStr += strArr.splice(0, 1);
                    strArr.splice(strArr.length - 1, 1);
                    const resultArr = [''];
                    resultArr.push(strArr.join('""'));
                    resultArr.push('');
                    resultStr += resultArr.join('"');
                    resultLinesArr.push(resultStr);
                } else {
                    resultLinesArr.push(item);
                }
            }
        } else {
            for(let i1 = 0; i1 < resultLinesArr.length; i1++) {
                const strArr = langLinesObj[locale][i1].split('"');
                let str = '';
                if (strArr.length > 3) {
                    strArr.splice(0, 1);
                    strArr.splice(strArr.length - 1, 1);
                    str = strArr.join('""');
                } else {
                    str = strArr[1];
                }
                resultLinesArr[i1] += `,"${str}"`
            }
        }
    }
    for(let item of resultLinesArr) {
        cb(item);
    }
}
