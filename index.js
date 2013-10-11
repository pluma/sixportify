/*! sixportify 0.2.0 Copyright (c) 2013 Alan Plum. MIT licensed. */
var through = require('through');
var re = /^\s*export\s+(?:var|let|const|class|function\*?)\s([_a-zA-Z][_a-zA-Z0-9]*)\s/;

function sixportify() {
    var data = '';
    function write(buf) {
        data += buf;
    }
    function end() {
        var self = this;
        var names = [];

        data.split('\n').forEach(function(line) {
            var match = re.exec(line);
            if (match) {
                names.push(match[1]);
                self.queue(line.replace(/^(\s*)export\s/, '$1'));
            } else {
                self.queue(line);
            }
            self.queue('\n');
        });

        if (!/\s*[;}]\s*$/.test(data)) {
            this.queue(';');
        }

        names.forEach(function(name) {
            self.queue('exports.');
            self.queue(name);
            self.queue(' = ');
            self.queue(name);
            self.queue(';\n');
        });

        this.queue(null);
    }
    return through(write, end);
}

module.exports = sixportify;
