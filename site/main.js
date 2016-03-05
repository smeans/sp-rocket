var cachemere = require('cachemere');
var http = require('http');

var url_map = {'/':'/index.html'};

var URL = require('url');

var js_handlers = {};

function handleJSRequest(req, res) {
  try {
    var url = URL.parse(req.url, true);
    var handler = url.pathname.substring('/~'.length);
    var mpa = handler.split('::');

    var jsr = require('./' + mpa[0] + '.js');
    jsr[mpa[1]](req, res, url.query);
  } catch (e) {
    console.log(e);

    req.url = "/www_public/400.html";

    cachemere.fetch(req, function (err, resource) {
      resource.output(res);

      return;
    });
  }
}

var server = http.createServer(function (req, res) {
    if (req.url.indexOf('/~') === 0) {
      handleJSRequest(req, res);

      return;
    }

    if (req.url in url_map) {
      req.url = url_map[req.url];
    }

    req.url = '/www_public' + req.url;

    cachemere.fetch(req, function (err, resource) {
        /*
        Note that you can manipulate the Resource object's
        properties before outputting it to the response.
        */
        if (err) {
          req.url = "/www_public/404.html";

          cachemere.fetch(req, function (err, resource) {
            resource.output(res);
          });
        } else {
          resource.output(res);
        }
    });
});

server.listen(8080);
