var join = require('../');
var r = join('test', [ 'output', 'test' ]);

r.reduce(function (acc, test, output) {
    var t = acc[test.id];
    if (!t) t = acc[test.id] = { commit : test.commit };
    
    if (!t.output) t.output = [];
    t.output.push(output.value);
    
    return acc;
}, {});

r.on('result', function (res) {
    console.dir(res);
});

r.insert({ type : 'output', test : 'abc123', value : 'beep ' });
r.insert({ type : 'output', test : 'abc123', value : 'boop\n' });
r.insert({
    type : 'test',
    id : 'abc123',
    commit : 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
});
