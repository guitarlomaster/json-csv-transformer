#json-csv трансформер

Используется для переводов.

##Расположение файлов

Исходники файлов, которые будут трансформироваться, находятся в дирректории `source`.

После исполнения скрипта результать трансформации будет находится в дирректории `dist`.

##Структура форматов

**JSON:**
```
{
    SECTION1: {
        key_1: "content 1",
        key_2: "content 2"
        ...
    },
    ...
    SECTION_N: {
        ...
        key_n: "content n",
    }
}
```

Назвния json файлов должны соответствовать названиям, которые ожидаются в первой строке таблицы csv.
Они будут разделены запятыми.

***

**CSV:**
```
key,ru,en,...
SECTION1.key_1,контент 1,content 1,...
...
SECTION_N.key_n,контент n,контент n,...
```
Элементы первой строки, перечисленные через запятую будут являться названиям json файлов.

##Скрипты
csv --> json: `node transform_csv-json.js`

json --> csv: `node transform_json-csv.js`

##Требования
Должна быть установлена `node` не ниже `8` версии.
