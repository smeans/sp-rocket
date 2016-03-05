function getGearPoints(pitchDiameter, toothCount, resolution, addendum, dedendum) {
  var pointArray = [];

  var pitchRadius = pitchDiameter/2.0;
  var pointCount = toothCount*resolution;

  for (var i = 0; i < pointCount; i++) {
    var angle = (2.0*Math.PI)*(i/pointCount);
    var vectorDisplacement = Math.sin((i%resolution)*(Math.PI/2)+(Math.PI/4));
    var radius = pitchRadius + (vectorDisplacement > 0 ? vectorDisplacement * addendum
        : vectorDisplacement * dedendum);
    var point = [Math.cos(angle)*radius, Math.sin(angle)*radius, 0];

    pointArray.push(point);
  }

  return pointArray;
}

function emitGearFaceSTL(file, gearPoints, normal, zOffset) {
  function writeln(s) {
    file.write(s + '\n');
  }
  var normalString = normal.join(' ');

  for (var i = 0; i < gearPoints.length; i++) {
    var p1 = gearPoints[i];
    var p2 = gearPoints[(i + 1) % gearPoints.length];
    writeln('facet normal ' + normalString);
    writeln(' outer loop');
    writeln(' vertex 0 0 ' + zOffset);
    writeln(' vertex ' + [p1[0], p1[1], zOffset].join(' '));
    writeln(' vertex ' + [p2[0], p2[1], zOffset].join(' '));
    writeln(' endloop');
    writeln('endfacet');
  }
}

function emitFacet(file, normal, points) {
  function writeln(s) {
    file.write(s + '\n');
  }

  writeln('facet normal ' + normal.join(' '));
  writeln(' outer loop');
  for (var i = 0; i < points.length; i++) {
    writeln(' vertex ' + points[i].join(' '));
  }
  writeln(' endloop');
  writeln('endfacet');
}

function emitRect(file, rect) {
    var dx = rect[0][0] - rect[1][0];
    var dy = rect[0][1] - rect[1][1];
    var normal = [-Math.sign(dy), Math.sign(dx), 0];

    emitFacet(file, normal, [rect[0], rect[1], rect[2]]);
    emitFacet(file, normal, [rect[0], rect[2], rect[3]]);
}

function emitGearEdgeSTL(file, gearPoints, startZ, endZ) {
  function writeln(s) {
    file.write(s + '\n');
  }

  for (var i = 0; i < gearPoints.length; i++) {
    var p1 = gearPoints[i];
    var p2 = gearPoints[(i + 1) % gearPoints.length];

    var rect = [
      [p1[0], p1[1], startZ],
      [p2[0], p2[1], startZ],
      [p2[0], p2[1], endZ],
      [p1[0], p1[1], endZ]
    ];

    emitRect(file, rect);
  }
}

function emitGearSTL(outputFile, pitchDiameter, toothCount, resolution, addendum, dedendum, thickness) {
  var gp = getGearPoints(pitchDiameter, toothCount, resolution, addendum, dedendum);

  outputFile.write('solid\n');
  emitGearFaceSTL(outputFile, gp, [0, 0, -1], 0);
  emitGearEdgeSTL(outputFile, gp, 0, thickness);
  emitGearFaceSTL(outputFile, gp, [0, 0, 1], thickness);
  outputFile.write('endsolid\n');
}

exports.gearSTL = function(req, res, params) {
  try {
    res.setHeader('Content-Type', 'application/sla');
    res.setHeader('Content-Disposition', 'attachment; filename=sprocket.stl');

    emitGearSTL(res, params.pitchDiameter, params.toothCount, 4, params.addendum, params.dedendum, params.thickness);
    res.end();
  } catch(e) {
    console.log(e);

    return false;
  }

  return true;
};
