'use strict';

const {resolve, basename, extname} = require('path');

const normalize = require('normalize-path');
const fg = require('fast-glob');

module.exports = function scanner(path, context, {glob}) {
    return fg.sync(normalize(resolve(path)), glob).map(file => {
        const exports = require(file);
        const item = {
            name: basename(file, extname(file)),
            resolve() {
                const value = exports(context, item);
                item.value = value;
                item.resolve = null;
                return value;
            },
        };
        return item;
    });
};
