const express = require('express')
const amqplib = require('amqplib')

let get = 0
let inc = 0
let ready = 0

let channel, amqp
const exchange = 'counter'
if (process.env.RABBITMQ_HOST){
    (async () => {
        try {
            amqp = await amqplib.connect({
                'hostname': process.env.RABBITMQ_HOST,
                'port':     process.env.RABBITMQ_PORT,
                'username': process.env.RABBITMQ_USER,
                'password': process.env.RABBITMQ_PASS,
            })
            channel = await amqp.createChannel()
            await channel.assertExchange(exchange, 'fanout', { durable: false })

            const { queue } = await channel.assertQueue('', { exclusive: true })
            await channel.bindQueue(queue, exchange, '')

            await channel.consume(queue, (message) => {
                url = message.content.toString()
                if (url == '/inc') inc = inc + 1
                else if (url == '/ready') ready = ready + 1
                else get = get + 1
            }, { noAck: true })
        }
        catch(err){
            console.log(err)
        }
    })()
}


const app = express()
const port = 80

app.use('/', async (req, res, next) => {
    console.log(`${Date()} - Get ${req.url}`)
    next()
})

app.use('/reset', async (req, res, next) => {
    get = inc = ready = 0
    next()
})

app.use('/', async (req, res) => {
    res.write(`get: ${get}, inc: ${inc}, ready: ${ready}`)
    res.end()
})

app.listen(port, () => {
    console.log(`[server]: Server is running at localhost:${port}`)
})
