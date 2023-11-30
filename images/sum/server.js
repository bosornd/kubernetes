const http = require('http')

number1 = 0
number2 = 0

const fs = require('fs')

try {
	const conf = JSON.parse(fs.readFileSync('/sum/conf.json'))
	console.log(conf)
	number1 = parseInt(conf.number1)
	number2 = parseInt(conf.number2)
}
catch (err){
	console.log(err)
}

if (process.env.NUMBER1)
	number1 = parseInt(process.env.NUMBER1)
if (process.env.NUMBER2)
	number2 = parseInt(process.env.NUMBER2)

console.log(`argv = ${process.argv}`)
if (process.argv.length > 3){
	number1 = parseInt(process.argv[2])
	number2 = parseInt(process.argv[3])
}

sum = number1 + number2
console.log(sum)

var handleRequest = function(request, response) {
  console.log(`${Date(Date.now())} - Get ${request.url}`)

  response.writeHead(200)
  response.end(`${sum}`)
}

var www = http.createServer(handleRequest)
www.listen(80)
