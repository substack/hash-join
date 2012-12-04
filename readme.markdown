# hash-join

compute [https://en.wikipedia.org/wiki/Hash_join](hash-joins)
on streaming document collections

# example

## hashing with functions

``` js
var join = require('hash-join');
var r = join(
    function (doc) { return doc.type === 'test' && doc.id },
    function (doc) { return doc.type === 'output' && doc.test }
);

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
```

```
$ node example/hash.js
{ abc123: 
   { commit: 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
     output: [ 'beep ' ] } }
{ abc123: 
   { commit: 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
     output: [ 'beep ', 'boop\n' ] } }
```

## using key path shortcuts

``` js
var join = require('hash-join');
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
```

```
$ node example/reduce.js
{ abc123: 
   { commit: 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
     output: [ 'beep ' ] } }
{ abc123: 
   { commit: 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
     output: [ 'beep ', 'boop\n' ] } }
```

## using [crdt](http://github.com/dominictarr/crdt)

``` js
var join = require('hash-join');
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

var doc = new(require('crdt').Doc);
doc.on('add', function (x) { r.insert(x.state) });

doc.add({ type : 'output', test : 'abc123', value : 'beep ' });
doc.add({ type : 'output', test : 'abc123', value : 'boop\n' });
doc.add({
    type : 'test',
    id : 'abc123',
    commit : 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
});
```

```
$ node example/reduce_crdt.js
{ abc123: 
   { commit: 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
     output: [ 'beep ' ] } }
{ abc123: 
   { commit: 'd8180b0778dd7a145b46f92b9a2d77db916debc5',
     output: [ 'beep ', 'boop\n' ] } }
```

# methods

``` js
var join = require('hash-join')
```

## var r = join(a, b)

Create a new 2-way join `r` from the hashing functions `a` and `b`.

Hashing functions should return falsy values if they don't match and otherwise
should return the string id they should hash into.

If `a` or `b` is an array, they are treated as a path through the document to
obtain the hashed element starting at the document's `'type'` field and deeply
traversing for the rest of the arguments. For example `['beep','boop','x',2]`
would resolve to the string `"ghi"` for this document:

``` json
{
  "type": "beep",
  "boop": { "x" : [ "abc", "def", "ghi" ] },
  "z" : 55
}
```

If `a` or `b` is a string, they are converted to `[a,'id']` or `[b,'id']`
accordingly so that you can more tersely express a foreign key relation on the
`"id"` field.

## r.insert(doc)

Insert a document into the join `r`.

## r.reduce(fn, init)

Compute a reduce over all the pairs that resolve to the same hash id with
`fn(acc, a, b)` for an accumulator `acc` and the objects `a` and `b` that match
the hashing functions supplied to or inferred from `join()` in the same order.

`fn(acc, a, b)` should return the new accumulator value `acc`.
Each time a new value is derived, the `'result'` event fires with the new
accumulator result.

The accumulator starts off with the value given by `init`.

# events

## r.on('result', function (res) {})

Whenever a new result value is obtained from the `reduce()`, this event fires
with the new accumulator value.

## r.on('pair', function (a, b) {})

Whenever a pair is matched, this event fires with each item in the pair in the
order specified to `join()`.

# install

With [npm](https://npmjs.org) do:

```
npm install hash-join
```

# license

MIT
