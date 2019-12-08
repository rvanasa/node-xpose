'use strict';

const debug = require('debug')('xpose');

let current = require('./current');

function xpose(options = {}) {
    if(arguments.length === 2) {
        options = {path: arguments[0], ...arguments[1]};
    }

    debug('context %o', options);
    const {
        path,
        include = current.context,
        scanner = require('./scanner'),
        eager,
    } = options;

    function inject(item) {
        const {name, override} = item;

        if(!override && mapping.hasOwnProperty(name)) {
            throw new Error(`Duplicate name: [${name}]`);
        }

        debug('%s -> %o', name, item);
        // if(item.resolver) {
        Object.defineProperty(mapping, name, {
            // configurable: true,
            enumerable: true,
            get() {
                if(item.resolve) {
                    debug(':: %s', item.name);
                    return current.withContext(context, item.resolve);
                }
                return item.value;
            },
        });
        // }
        // else {
        //     mapping[name] = value;
        // }
    }

    function injectAll(include) {
        if(Array.isArray(include)) {
            include.forEach(injectAll);
        }
        else if(include) {
            Object.keys(include).forEach(key => inject({
                name: key,
                resolve: () => include[key],
            }));
        }
    }

    function find(name) {
        if(name[0] === name[0].toUpperCase() && !mapping.hasOwnProperty(name)) {
            throw new Error(`Undefined name: [${name}]`);
        }
        // debug('find %s', name);
        return mapping[name];
    }

    function preload(query) {
        if(typeof query === 'string') {
            find(query);
        }
        else if(Array.isArray(query)) {
            query.forEach(preload);
        }
        else if(query === true) {
            Object.values(context);
        }
        else if(query) {
            throw new Error(`Cannot preload from query: ${query}`);
        }
    }

    const mapping = {};
    injectAll(include);
    const context = new Proxy(mapping, {
        get(target, prop) {
            return find(prop);
        },
    });

    if(path) {
        const items = scanner(path, context, options);
        if(!items/* || !items.length*/) {
            throw new Error(`No items were found with path: ${path}`);
        }
        items.forEach(item => inject(item));
    }

    preload(eager);

    return context;
}

module.exports = xpose;

// module.exports = new Proxy(xpose, {
//     get(target, prop) {
//         if(!current.context) {
//             throw new Error(`No current context`);
//         }
//         return current.context.find(prop);
//     },
//     set() {
//         throw new Error(`Use require('xpose/current').context to modify current context`);
//     },
// });
