'use strict';

const coreTypes = require('..');
const assert = require('assert').strict;

assert.strictEqual(coreTypes(), 'Hello from coreTypes');
console.info('coreTypes tests passed');
