const http = require('http')
const process = require('process')

const JOB_WORKER = process.env.JOB_WORKER
const JOB_QUEUE_URL = process.env.JOB_QUEUE_URL + '/dequeue'

const data = `queue=${JOB_WORKER}`

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
    },
}

const req = http.request(JOB_QUEUE_URL, options, (res) => {
    let exit_code = 0
    res.on('data', (job) => {
        if (job != null){
            console.log(`${JOB_WORKER} handles the requested job - ${job}.`)
            exit_code = 1
        }
    })

    res.on('end', () => {
        if (exit_code == 0)
            console.log('no more jobs in the queue.')

        process.exit(exit_code)
    })
});


req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`)
})


req.write(data)
req.end();
