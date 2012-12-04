var EventEmitter = require('events').EventEmitter;

module.exports = Join;
function Join (a, b) {
    if (!(this instanceof Join)) return new Join(a, b);
    if (!Array.isArray(a)) a = [ a, 'id' ];
    if (!Array.isArray(b)) b = [ b, 'id' ];
    
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
    if (id !== undefined) {
        save(id, 'a', doc);
        return;
    }
    
    id = getHash(doc, self.b);
    if (id !== undefined){
        save(id, 'b', doc);
        return;
    }
};

function getHash (doc, parts) {
    if (doc.type !== parts[0]) return undefined;
    
    var node = doc;
    
    for (var i = 1; i < parts.length; i++) {
        if (typeof node !== 'object') return undefined;
        node = node[parts[i]];
    }
    return node;
}
