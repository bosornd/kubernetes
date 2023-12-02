const express = require('express')
const redis = require('redis')

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
    return await connectRedisClient(process.env.JOB_DB_URL_FOR_READ)
}

const connectRedisClientForWrite = async function(){
    return await connectRedisClient(process.env.JOB_DB_URL_FOR_WRITE)
}

const enqueueJob = async function(queue, job){
    let redisClient = await connectRedisClientForWrite()
    await await redisClient.rPush(queue, job)
    await redisClient.disconnect()
}

const dequeueJob = async function(queue){
    let redisClient = await connectRedisClientForWrite()
    let job = await redisClient.lPop(queue)
    await redisClient.disconnect()
    return job
}

const app = express()
const port = 80

app.use(express.urlencoded({ extended: true }))

app.post('/enqueue', async (req, res) => {
    const queue = req.body.queue
    const job = req.body.job

    console.log(`enqueue job(${job}) to queue(${queue}).`)
    await enqueueJob(queue, job)

    res.send(job)
})

app.post('/dequeue', async (req, res) => {
    const queue = req.body.queue

    let job = await dequeueJob(queue)
    console.log(`dequeue job(${job}) from queue(${queue}).`)

    res.send(job)
})

app.listen(port, () => {
    console.log(`[server]: Server is running at localhost:${port}`)
})
