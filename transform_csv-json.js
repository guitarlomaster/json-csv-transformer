const fs = require('fs'),
    sh = require('shelljs');

removeDist();
startReadingCsv();

function removeDist() {
    if (fs.existsSync(__dirname + '/dist')) {
        sh.rm('-rf', __dirname + '/dist');
        sh.mkdir('-p', __dirname + '/dist/json');
    } else {
        sh.mkdir('-p', __dirname + '/dist/json');
    }
}

function startReadingCsv() {

}
