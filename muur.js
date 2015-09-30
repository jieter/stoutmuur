
var size = {
    breedte: 610,
    hoogte: 205,
    gerealiseerd: 49,

    dikte: 5,
    lagenmaat: 5 + 1,
    stones: [
        {lengte:    1, dx:   21 + 1, w:   21, name: 'strek'}, // 0
        {lengte:  0.5, dx:   10 + 1, w:   10, name: 'kop'}, // 1
        {lengte: 0.25, dx:  4.5 + 1, w:  4.5, name: 'klisklezoor'}, // 2
        {lengte: 0.75, dx: 15.5 + 1, w: 15.5, name: 'drieklezoor'}, // 3
        {lengte:    1, dx:   10 + 1, w:   10, name: 'uitstekend'} // 4
    ]
};
var stones = {};
size.stones.forEach(function (stone, i) {
    stones[stone.name] = i;
});

var lagen = size.hoogte / size.lagenmaat;
var lengtes = size.breedte / 21 + 1;

function rand(a, b) {
    return Math.floor(Math.random() * b + 1) - 1;
}

var verbanden = {
    halfsteens: function (breedte, lagen) {
        return d3.range(0, lagen).map(function (i) {
            var laag = d3.range(0, breedte - 1).map(function () { return stones.strek; });
            if (i % 2 == 0) {
                laag.unshift(stones.kop);
            } else {
                laag.push(stones.kop);
            }
            return laag;
        });
    },

    kruis: function (breedte, lagen) {
        return d3.range(0, lagen).map(function (i) {
            if (i % 2 == 0) {
                return d3.range(0, breedte * 2 - 1).map(function () { return stones.kop; });
            } else {
                return [stones.klisklezoor].concat(
                    d3.range(0, breedte - 1).map(function () { return stones.strek; })
                ).concat([stones.klisklezoor]);
            }
        });
    },

    random: function (breedte, lagen) {
        return d3.range(0, lagen).map(function (i) {
            var laag = d3.range(0, breedte).map(function () { return rand(0, 2); });
            if (i % 2 == 0) {
                laag.unshift(stones.klisklezoor);
            }
            return laag;
        });
    }
};

function is_protruding(laag) {
    var hoogte = laag * size.lagenmaat;
    var normalized = (hoogte - size.gerealiseerd) / (size.hoogte - size.gerealiseerd);

    if (hoogte < size.gerealiseerd) {
        return true;
    }
    return Math.random() < (normalized + 0.10) / 4;
}

var laag_breedte = function (row, index) {
    var ret = 0;
    for (var i = 0; i < index; i++) {
        ret += size.stones[row[i]].lengte;
    }

    return ret;
};

var randomizers = {
    koppen: function (muur) {
        return muur.map(function (row, i) {
            // bestaande muur, niks aan doen
            if (i < size.gerealiseerd / size.lagenmaat) { return row; }

            var num_protruding = 0;
            return row.map(function (s) {
                if (s == stones.kop && num_protruding < 2 && is_protruding(i)) {
                    num_protruding++;
                    return stones.uitstekend;
                }
                num_protruding = 0;
                return s;
            });
        });
    },
    halfsteens: function (muur) {
        var row, strekken;
        for (var i = 0; i < muur.length; i++) {
            // bestaande muur, niks aan doen
            if (i < size.gerealiseerd / size.lagenmaat) { continue; }

            row = muur[i];

            // initialize at 2 to allow replacements in first two strekken.
            strekken = 2;

            for (var j = 0; j <= row.length; j++) {
                var s = row[j];
                if (s == stones.strek && strekken > 1 && is_protruding(i)) {
                    // kijk omlaag om te zien of daar op deze index een
                    // uitsteker zit.

                    // vervang deze streksteen met twee kopse waarvan 1 uitstekend.
                    if (Math.random() < 0.5) {
                        muur[i].splice(j, 1, stones.kop, stones.uitstekend);
                    } else {
                        muur[i].splice(j, 1, stones.uitstekend, stones.kop);
                    }
                    strekken = 0;
                } else {
                    strekken++;
                }
            }
        }
        return muur;
    }
};

var p = plot('randomized halfsteens', size);

var genereer = function () {
    p.render(randomizers.halfsteens(verbanden.halfsteens(lengtes - 3, lagen)));
};

genereer();

d3.select('button').on('click', genereer);
d3.select(window).on('resize', function () {
    p.resize();
});
