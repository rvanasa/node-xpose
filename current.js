'use strict';

const debug = require('debug')('xpose:current');

const current = {
    context: null,
    withContext(context, callback) {
        if(current.context === context) {
            return callback(context);
        }

        const prev = current.context;
        try {
            debug('%o', context && Object.keys(context));
            current.context = context;
            return callback(context);
        }
        finally {
            current.context = prev;
        }
    },
};

module.exports = current;