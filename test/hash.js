var test = require('tape');
var join = require('../');

test('hash join', function (t) {
    t.plan(4);
    
    var r = join(
        function (doc) { return doc.type === 'test' && doc.id },
        function (doc) { return doc.type === 'output' && doc.test }
    );

    r.reduce(function (acc, test, output) {
        var ot = acc[test.id];
        if (!ot) ot = acc[test.id] = { commit : test.commit };
        t.equal(test.id, output.test);
        
        if (!ot.output) ot.output = '';
        ot.output += output.value;
        
        return acc;
    }, {});
    
    var expected = [
        {
            'abc123' : {
                commit : 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
                output : 'beep '
            }
        },
        {
            'abc123' : {
                commit : 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
                output : 'beep boop\n'
            }
        }
    ];
    r.on('result', function (res) {
        t.same(res, expected.shift());
    });

    r.insert({ type : 'output', test : 'abc123', value : 'beep ' });
    r.insert({ type : 'output', test : 'abc123', value : 'boop\n' });
    r.insert({
        type : 'test',
        id : 'abc123',
        commit : 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
    });
});
