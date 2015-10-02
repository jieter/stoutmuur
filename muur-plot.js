var container = d3.select('body');

var margin = {
    left: 30,
    right: 10,
    top: 0,
    bottom: 40
};
// var width = function () { return container.offsetWidth; };
var containerWidth = function () {
    return Math.max(800, document.querySelector('body').offsetWidth);
};
var width = function () {
    return containerWidth() - margin.left - margin.right;
};

/* exported plot */
function plot(naam, size) {
    var Plot = function () {};
    Plot.size = size;

    var containerHeight = function () {
        var height = Math.floor(containerWidth() * (Plot.size.hoogte / Plot.size.breedte));
        return Math.max(250, height);
    };
    var height = function () {
        return containerHeight() - margin.top - margin.bottom;
    };

    d3.select('body').append('h2').text(naam);
    var svg = container.append('svg').attr({
        width: containerWidth(),
        height: containerHeight()
    });

    var wall = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scale.linear().range([width(), 0]);
    var y = d3.scale.linear().range([10, height()]);

    var axis = {
        x: d3.svg.axis().scale(x).orient('bottom'),
        y: d3.svg.axis().scale(y).orient('left')
    };


    Plot.transform = function transform (input) {
        var out = [];

        input.forEach(function (row, rowid) {
            var rowY = Plot.size.dikte + rowid * (Plot.size.lagenmaat);
            var rowX = 0;
            row.forEach(function (b) {
                var s = Plot.size.stones[b];

                out.push({
                    x: rowX,
                    y: rowY,
                    width: s.w,
                    class: s.name
                });
                rowX += s.dx;
            });
        });

        return out;
    }

    var brick = function (selection) {
        selection.attr({
            class: function (d) { return 'brick ' + d.class; },
            x: function (d) { return x(d.x); },
            y: function (d) { return y(d.y); },
            width: function (d) { return x(d.width); },
            height: function () { return height() - y(Plot.size.dikte); }
        });
    };

    for (var key in axis) {
        var el = wall.append('g').attr('class', 'axis ' + key).call(axis[key]);
        if (key == 'x') {
            el.attr('transform', 'translate(0, ' + height() + ')');
        }
    }

    var bricks = wall.append('g').attr('class', 'bricks');

    Plot.render = function (data) {
        x.domain([Plot.size.breedte, 0]);
        y.domain([Plot.size.hoogte, 0]);

        for (var key in axis) {
            var el = wall.select('.axis.' + key).call(axis[key]);
            if (key == 'x') {
                el.attr('transform', 'translate(0, ' + height() + ')');
            }
        }

        data = this.transform(data);

        var selection = bricks.selectAll('.brick').data(data);

        selection.enter().append('rect');
        selection.exit().remove();

        selection.call(brick);
    };

    Plot.resize = function () {
        svg.attr({
            width: containerWidth(),
            height: containerHeight()
        });

        x.range([width(), 0]);
        y.range([10, height()]);
        for (var key in axis) {
            var el = wall.select('.axis.' + key).call(axis[key]);
            if (key == 'x') {
                el.attr('transform', 'translate(0, ' + height() + ')');
            }
        }

        bricks.selectAll('.brick').call(brick);
    };
    Plot.updateSize = function (size) {
        this.size = size;
        this.resize();

    };
    return Plot;
}
