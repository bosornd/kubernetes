var http = require('http')
var os = require('os')

var host = os.hostname()

function getServerIp() {
  var ifaces = os.networkInterfaces();
  var result = '';

  for (var dev in ifaces) {
      var alias = 0;
      ifaces[dev].forEach(function(details) {
          if (details.family == 'IPv4' && details.internal === false) {
              result = details.address;
              ++alias;
          }
      });
  }

  return result;
}

var ip = getServerIp()

var handleRequest = function(request, response) {
  console.log(`${Date(Date.now())} - Get ${request.url}`)

  response.writeHead(200)
  response.end(`Server is running on ${host}(${ip}).`)
}

var www = http.createServer(handleRequest)
www.listen(80)
