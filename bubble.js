$(function() {

  var color_scale = d3.scale.linear()
      .domain([0, 1, 2, 3])
      .range(["#C30132", "#FFD200", "#00A267", "#0087BE"]);

  var heat_scale = d3.scale.linear()
      .domain([500, 1500]) // various screen widths
      .range([.125, .175]); // correspondig alphas

  var width = $("#viz").width(),
      height = $("#viz").height();

  randLog = d3.random.logNormal(3.4, .5)

  function generateData() {
    var nodes = d3.range(75).map(function(e, i) { 
      radius = Math.min(randLog(), 80);
      return {
        radius: radius,
        offset: radius > 25 ? getRandomInt(-15, -10) : getRandomInt(0, 5), //getRandomElement([-10, -15]) : getRandomElement([0, 5]),
        color: color_scale(i % 4)
      };
    });
    return nodes;
  }
  
  function animate(nodes) {
    var root = nodes[0];
    root.radius = 30;
    root.fixed = true;
    root.x = width + (width / 100.0);
    root.y = height + (height / 100.0);

    var force = d3.layout.force()
        .gravity(0.007)
        .charge(function(d, i) { return i ? 0 : 2000; })
        .nodes(nodes)
        .theta(.8)
        .chargeDistance(2000)
        .size([width * 1.5, height * 1.5]);

    setTimeout(function() {
      $(".node").fadeIn(1000);
      force.start();
      force.alpha(heat_scale(root.x));
    }, 1000);

    var svg = d3.select("#viz").append("svg");

    node = svg.selectAll('.node')
        .data(nodes.slice(1))
      .enter().append("g")
        .style('display', 'none')
        .attr('class', 'node');

    node.append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d, i) { return d.color; })
      .style('opacity', 1);

    force.on("tick", function(e) {
      var q = d3.geom.quadtree(nodes),
          i = 0,
          n = nodes.length;

      while (++i < n) q.visit(collide(nodes[i]));

      node.attr('transform', function(d) { return 'translate('+d.x+','+d.y+')'; })
    });

    force.on("end", function(e) {

    });
  }

  function collide(node) {
    var r = node.radius + 200,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = node.radius + quad.point.radius + node.offset;
        if (l < r) {
          l = (l - r) / l * .5;
          node.x -= x *= l;
          node.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomElement(elements) {
    return elements[Math.floor(Math.random()*elements.length)];
  }

  data = generateData();
  animate(data);
});