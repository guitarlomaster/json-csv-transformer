const fs = require('fs'),
    readline = require('readline'),
    sh = require('shelljs');

const readStream = fs.createReadStream(__dirname + '/source/csv/translations.csv', 'utf8');
const lr = readline.createInterface({
    input: readStream
});
let localesArr = []; // массив локалей
let localesObj = {}; // обьект с переводами в локалях

removeDist();
readCsv();

function removeDist() {
    if (fs.existsSync(__dirname + '/dist')) {
        sh.rm('-rf', __dirname + '/dist');
        sh.mkdir('-p', __dirname + '/dist/json');
    } else {
        sh.mkdir('-p', __dirname + '/dist/json');
    }
}

function readCsv() {
    let firstLinePassed = false;
    lr.on('line', (line) => {
        if (!firstLinePassed) {
            localesArr = getLocalesArr(line);
            firstLinePassed = true;
        } else {
            setTranslations(line);
        }
    });
    lr.on('close', () => {
        createJsonFiles();
    });
}

function setTranslations(line) {
    const arr = line.split(',');
    const keys = arr[0].split('.');
    const key1 = keys[0];
    const key2 = keys[1];
    let formedArr = [];
    // условие для случаев, когда запятая есть только в разделителе
    if (arr.length - 1 === localesArr.length) {
        let itemBuffer = [];
        // итерируем переводы (как бы по локалям)
        for(let i = 0; i < arr.length; i++) {
            let item = checkAndReplace(arr[i], '""', '##');
            let newItem;
            // условие для строки, обособленной кавычками
            if (item[0] === '"' && item[item.length - 1] === '"') {
                newItem = item.split('"');
                newItem.splice(0, 1);
                newItem.splice(newItem.length - 1, 1);
                itemBuffer.push(...newItem);
            } else {
                itemBuffer.push(item);
            }
        }
        formedArr = itemBuffer;
    } else {
        let quoteStarted = false;
        let itemBuffer = [];
        // итерируем переводы (как бы по локалям)
        for(let i = 0; i < arr.length; i++) {
            let item = checkAndReplace(arr[i], '""', '##');
            let newItem;
            // условие для строки, обособленной кавычками
            if (item[0] === '"' && item[item.length - 1] === '"') {
                newItem = item.split('"');
                newItem.splice(0, 1);
                newItem.splice(newItem.length - 1, 1);
                formedArr.push(...newItem);
            }
            // условие для фиксирования открытия кавычки
            else if (!quoteStarted && item[0] === '"') {
                newItem = item.split('"');
                newItem.splice(0, 1);
                itemBuffer.push(...newItem);
                quoteStarted = true;
            }
            // условие для добавления элемента между открытием и закрытием кавычки
            else if (quoteStarted && item[item.length - 1] !== '"') {
                itemBuffer.push(item);
            }
            // условие для фиксирования закрытия кавычки
            else if (quoteStarted && item[item.length - 1] === '"') {
                newItem = item.split('"');
                newItem.splice(newItem.length - 1, 1);
                itemBuffer.push(...newItem);
                formedArr.push(itemBuffer.join(','));
                itemBuffer = [];
                quoteStarted = false;
            } else {
                formedArr.push(item);
            }
        }
    }
    formedArr.splice(0, 1); // удаляем ключь из массива
    formedArr = replaceSubstringsInArr(formedArr, '##', '\"');
    addToLocalesObj(key1, key2, formedArr);
}

function replaceSubstringsInArr(arr, from, to) {
    const newArr = [];
    for(let str of arr) {
        const replacedStr = checkAndReplace(str, from, to);
        newArr.push(replacedStr);
    }
    return newArr;
}

function checkAndReplace(str, from, to) {
    if (str.indexOf(from) === -1) {
        return str;
    } else {
        return str.split(from).join(to);
    }
}

function getLocalesArr(localesStr) {
    const arr = localesStr.split(',');
    arr.splice(0, 1);
    return arr;
}

function addToLocalesObj(key1, key2, arr) {
    for(let i = 0; i < localesArr.length; i++) {
        const locale = localesArr[i];
        if (!localesObj[locale]) {
            localesObj[locale] = {};
        }
        if (!localesObj[locale][key1]) {
            localesObj[locale][key1] = {};
        }
        localesObj[locale][key1][key2] = arr[i];
    }
}

function createJsonFiles() {
    for(let locale of localesArr) {
        fs.writeFileSync(`${__dirname}/dist/json/${locale}.json`, JSON.stringify(localesObj[locale]));
    }
}

