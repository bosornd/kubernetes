const express = require('express')
const redis = require('redis')

const amqplib = require('amqplib')

let channel, amqp
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
            await channel.assertExchange('counter', 'fanout', { durable: false })
        }
        catch(err){
            console.log(err)
        }
    })()
}

const connectRedisClient = async function(url){
    const redisClient = redis.createClient({ url: url })
    try {
        await redisClient.connect()
    }
    catch(error){
        console.log(error)
        return connectRedisClient(url)
    }
    
    return redisClient
}

const connectRedisClientForRead = async function(){
    return await connectRedisClient(process.env.COUNT_DB_URL_FOR_READ)
}

const connectRedisClientForWrite = async function(){
    return await connectRedisClient(process.env.COUNT_DB_URL_FOR_WRITE)
}

const getCount = async function(){
    let redisClient = await connectRedisClientForRead()
    let data = await redisClient.get('count')
    await redisClient.disconnect()
    if (data) return parseInt(data)
    return 0
}

const increaseCount = async function(){
    let redisClient = await connectRedisClientForWrite()
    let count = await redisClient.incr('count')
    await redisClient.disconnect()
    return count
}

const app = express()
const port = 80

app.use('/', async (req, res, next) => {
    console.log(`${Date()} - Get ${req.url}`)

    if (process.env.RABBITMQ_HOST){
        await channel.publish('counter', '', Buffer.from(req.url))
    }

    next()
})

app.use('/inc', async (req, res) => {
    const count = await increaseCount()
    res.write(count.toString())
    res.end()
})

app.use('/', async (req, res) => {
    const count = await getCount()
    res.write(count.toString())
    res.end()
})

app.listen(port, () => {
    console.log(`[server]: Server is running at localhost:${port}`)
})
