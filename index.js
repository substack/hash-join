var EventEmitter = require('events').EventEmitter;

module.exports = Join;
function Join (a, b) {
    if (!(this instanceof Join)) return new Join(a, b);
    if (typeof a !== 'function' && !Array.isArray(a)) a = [ a, 'id' ];
    if (typeof b !== 'function' && !Array.isArray(b)) b = [ b, 'id' ];
    
    EventEmitter.call(this);
    
    this.a = a;
    this.b = b;
    this.hash = {};
}

Join.prototype = new EventEmitter;

Join.prototype.reduce = function (cb, init) {
    var self = this;
    var acc = init;
    
    self.on('pair', function (a, b) {
        acc = cb(acc, a, b);
        self.result = acc;
        self.emit('result', acc);
    });
};

Join.prototype.insert = function (doc) {
    var self = this;
    var hash = self.hash;
    
    function save (id, key, doc) {
        if (!hash[id]) hash[id] = { a : [], b : [] };
        hash[id][key].push(doc);
        
        if (key === 'a') {
            hash[id].b.forEach(function (b) {
                self.emit('pair', doc, b);
            });
        }
        else {
            hash[id].a.forEach(function (a) {
                self.emit('pair', a, doc);
            });
        }
    }
    
    var id;
    
    id = getHash(doc, self.a);
    if (id) return save(id, 'a', doc);
    
    id = getHash(doc, self.b);
    if (id) return save(id, 'b', doc);
};

function getHash (doc, parts) {
    if (typeof parts === 'function') {
        return parts(doc);
    }
    
    if (doc.type !== parts[0]) return undefined;
    
    var node = doc;
    
    for (var i = 1; i < parts.length; i++) {
        if (typeof node !== 'object') return undefined;
        node = node[parts[i]];
    }
    return node;
}
