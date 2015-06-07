var test = require('tap').test;
var mdeps = require('module-deps');
var bpack = require('browser-pack');
var insert = require('../');
var concat = require('concat-stream');
var vm = require('vm');

test('always insert', function (t) {
    t.plan(10);
    var s = mdeps({
        transform: inserter,
        modules: {
            buffer: require.resolve('buffer/')
        }
    });
    s.pipe(bpack({ raw: true })).pipe(concat(function (src) {
        var c = {
            t: t,
            process: 'sandbox process',
            Buffer: 'sandbox Buffer',
            __filename: 'sandbox __filename',
            __dirname: 'sandbox __dirname',
            custom: 'sandbox custom',
            self: { xyz: 555 }
        };
        vm.runInNewContext(src, c);
    }));
    s.end(__dirname + '/always/main.js');
});

function inserter (file) {
    return insert(file, { always: true });
}

test('always insert custom globals without defaults', function (t) {
    t.plan(7);
    var s = mdeps({
        transform: inserter_custom,
        modules: {
            buffer: require.resolve('buffer/')
        }
    });
    s.pipe(bpack({ raw: true })).pipe(concat(function (src) {
        var c = {
            t: t,
            process: 'sandbox process',
            Buffer: 'sandbox Buffer',
            __filename: 'sandbox __filename',
            __dirname: 'sandbox __dirname',
            custom: 'sandbox custom',
            self: { xyz: 555 }
        };
        vm.runInNewContext(src, c);
    }));
    s.end(__dirname + '/always/custom_globals_without_defaults.js');
});

function inserter_custom (file) {
    return insert(file, { always: true, vars: {
        global: undefined,
        process: undefined,
        Buffer: undefined,
        __filename: undefined,
        __dirname: undefined,
        custom: function() { return '"inserted custom"' }
    }});
}
