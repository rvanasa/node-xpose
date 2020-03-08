# xpose

A tiny, flexible dependency injection library for NodeJS.

## Installation

```sh
$ npm install -S xpose
```

## Example usage 

#### /index.js
```js
const xpose = require('xpose');

const {App} = xpose({
    path: 'src/app/**/*.js',
    eager: true,
    include: [
        xpose({
            path: 'src/lib/**/*.js',
        }),
    ],
});
```

#### /src/app/App.js
```js
module.exports = ({Service}) => {

    console.log(Service); // 123
}
```

#### /src/app/Service.js
```js
module.exports = ({Helper}) => {

    console.log('Access to helper library:', Helper);

    return 123;
}
```

#### /src/lib/Helper.js
```js
module.exports = () => {
    return {
        // Lazy-loaded resource
    };
}
```