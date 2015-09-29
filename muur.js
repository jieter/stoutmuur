var container = d3.select('body');

var margin = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 40
};
// var width = function () { return container.offsetWidth; };
var outerWidth = function () { return 1200; };
var width = function () { return outerWidth() - margin.left - margin.right; };
var outerHeight = Math.floor(outerWidth() * (2 / 7));
var height = outerHeight - margin.top - margin.bottom;


function plot(naam, muur, size) {
    d3.select('body').append('h2').text(naam);
    var svg = container.append('svg').attr({
        width: outerWidth(),
        height: outerHeight
    })

    var wall = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scale.linear().range([width(), 0]);
    var y = d3.scale.linear().range([10, height]);

    var axis = {
        x: d3.svg.axis().scale(x).orient('bottom'),
        y: d3.svg.axis().scale(y).orient('left')
    }

    x.domain([700, 0]);
    y.domain([205, 0]);

    function transform (input) {
        var out = [];

        input.forEach(function (row, rowid) {
            var rowY = size.dikte + rowid * (size.lagenmaat);
            var rowX = 0;
            row.forEach(function (b) {
                var s = size.stones[b];

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
    var data = transform(muur);

    var graph_hoogte = height - y(size.dikte);

    var brick = function (selection) {
        selection.append('rect').attr({
            class: function (d) { return 'brick ' + d.class; },
            x: function (d) { return x(d.x); },
            y: function (d) { return y(d.y); },
            width: function (d) { return x(d.width); },
            height: function (d) { return graph_hoogte; }
        });
    };

    var bricks = wall.append('g').attr('class', 'bricks');

    var selection = bricks.selectAll('.brick')
        .data(data)
            .enter()
                .call(brick);


    for (var key in axis) {
        var parent = key == 'rx' ? distr : wall;
        var el = parent.append('g').attr('class', 'axis ' + key).call(axis[key]);
        if (key == 'x' || key == 'rx') {
            el.attr('transform', 'translate(0, ' + height + ')')
        }
    }

    var line = function (sel) {
        sel.attr('d', d3.svg.line()
            .x(function (d) { return rx(d[0]); })
            .y(function (d) { return y(d[1]); })
        );
    };

}
