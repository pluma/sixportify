# Synopsis

**sixportify** is a [browserify](https://github.com/substack/node-browserify) transform that enables you to write CommonJS module exports [as if you were using ES6](http://wiki.ecmascript.org/doku.php?id=harmony:modules) (also known as harmony).

[![NPM version](https://badge.fury.io/js/sixportify.png)](http://badge.fury.io/js/sixportify) [![Dependencies](https://david-dm.org/pluma/sixportify.png)](https://david-dm.org/pluma/sixportify)

# Install

## Node.js

### With NPM

```sh
npm install sixportify
```

### From source

```sh
git clone https://github.com/pluma/sixportify.git
cd sixportify
npm install
```

# Basic usage example

## somelib.js

```javascript
export var config = {x: 4};
export function addX(y) {
    return config.x + y;
}
```

## index.js

```javascript
var somelib = require('./somelib.js');
console.log(somelib.addX(1)); // 5
somelib.config.x = 2;
console.log(somelib.addX(1)); // 3
```

## Usage

```javascript
var browserify = require('browserify'),
    sixportify = require('sixportify'),
    b = browserify();

b.transform(sixportify);
b.add('./index.js');
b.bundle().pipe(require('fs').createWriteStream('bundle.js'));
```

# Usage example with `es6ify`

## somelib.js

```javascript
const BAR = "Hello World!";
export class Foo {
    greet() {
        console.log(BAR);
    }
}
```

## index.js

```javascript
var {Foo} = require('./somelib.js');
(new Foo()).greet(); // "Hello World!"
```

## Usage

```javascript
var browserify = require('browserify'),
    siportify = require('sixportify'),
    es6ify = require('es6ify'),
    b = browserify();

b.transform(sixportify); // should always come before es6ify
b.add(es6ify.runtime);
b.transform(es6ify);
b.add('./index.js');
b.bundle().pipe(require('fs').createWriteStream('bundle.js'));
```

# Caveats

The implementation is incredibly naïve.

If your export statements are not at the beginning of the line (optionally indented with any whitespace character), `sixportify` won't find them:

```javascript
// This won't work.
var foo = 'bar'; export var baz = 'qux';

// This won't work either.
export var
    foo = 'bar';

// Nor will this.
export var foo = 'bar',
    qux = 'baz'; // `qux` will not be exported!

// This is fine, though:
export var foo = {
    'bar': 'qux'
};
```

While `sixportify` works just fine with variable declarations,
keep in mind that re-assignment may have unintended consequences. E.g.

```javascript
export var foo = 'bar';
foo = 'qux';
```

In this case the value that will actually be exported as `exports.foo`
will be `"qux"`, not `"bar"`.

You should therefore treat exported `var` declarations as constants.

Likewise, the following will not work as intended:

```javascript
// in somelib.js
export var foo = 'bar';
export function greet() {
    console.log('Hello, ' + foo + '!'); // still refers to the local var
}

// in index.js
var somelib = require('./somelib.js');
somelib.foo = 'world'; // re-assigns the exported var
somelib.greet(); // "Hello bar!"
```

# ES6/harmony, let, const, generators and classes

If you want to use `sixportify` with ES6-style classes, you can do that:

```javascript
// in somelib.es6
export class Foo {
    greet() {
        console.log('sup');
    }
}

// in index.es6
var Foo = require('./somelib.es6').Foo;
var foo = new Foo();
foo.greet(); // "sup"
```

Generators (`function*`) as well as variables declared with `let` or `const`
are fully supported too (even though the latter two shouldn't really be exportable according to harmony -- if the runtime supports it, `sixportify` won't judge you).

This means you can use sixportify to preprocess your ES6-style exports for [es6ify](https://github.com/thlorenz/es6ify).

Keep in mind that `sixportify` does not understand decomposition, so the following will not work:

```javascript
// BROKEN!
var obj = {'foo': 'bar'};
export var {foo} = obj;
// ALSO BROKEN!
var arr = ['hello'];
export var [qux] = arr;
```

# Unlicense

This is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying [UNLICENSE](https://github.com/pluma/sixportify/blob/master/UNLICENSE) file.