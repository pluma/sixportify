/*! sixportify 0.3.1 Original author Alan Plum <me@pluma.io>. Released into the Public Domain under the UNLICENSE. @preserve */
var through = require('through');
var re = /^\s*export\s+(?:var|let|const|class|function\*?)\s([_a-zA-Z]\w*)[^\w]/;

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
