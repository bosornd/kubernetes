var http = require('http')
const queryString = require('querystring')

function fibonacci(number) {
  if (number < 2) {
    return number;
  }

  return fibonacci(number - 1) + fibonacci(number - 2)
}

var handleRequest = function(request, response) {
  var n = parseInt(queryString.parse(request.url)['/?n'])

  if (isNaN(n)){
    response.writeHead(200)
    response.end('Usage: url?n=10 returns fibonacci(n)')
  }
  else {
    var f = fibonacci(n)
    console.log(`fibonacci(${n}) = ${f}`)

    response.writeHead(200)
    response.end(f.toString())
  }
}

var www = http.createServer(handleRequest)
www.listen(80)
