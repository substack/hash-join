var test = require('tape');
var join = require('../');

test('many to many', function (t) {
    t.plan(9);
    var r = join(['test','target'], ['output','test']);
    
    r.reduce(function (acc, test, output) {
        var res = acc[test.target];
        if (!res) res = acc[test.target] = {};
        t.equal(test.target, output.test);
        
        if (!res.output) res.output = [];
        res.output.push(output.value);
        
        if (!res.xs) res.xs = [];
        res.xs.push(test.value);
        
        return acc;
    }, {});
    
    r.insert({ type : 'output', test : 'abc123', value : 'beep ' });
    r.insert({ type : 'output', test : 'abc123', value : 'boop' });
    r.insert({ type : 'output', test : 'abc123', value : '!!!' });
    r.insert({ type : 'test', target : 'def456', value : 6 });
    r.insert({ type : 'output', test : 'def456', value : 'ra' });
    r.insert({ type : 'test', target : 'abc123', value : 5 });
    r.insert({ type : 'test', target : 'abc123', value : 7 });
    r.insert({ type : 'output', test : 'def456', value : 'wr!' });
    
    setTimeout(function () {
        t.same(r.result, {
            abc123 : {
                output : [ 'beep ', 'boop', '!!!', 'beep ', 'boop', '!!!' ],
                xs : [ 5, 5, 5, 7, 7, 7 ]
            },
            def456 : {
                output : ['ra','wr!'],
                xs : [ 6, 6 ]
            }
        });
    }, 100);
});
