import {Worker} from 'bullmq'
import IoRedis   from 'ioredis'
const connection = new IoRedis({maxRetriesPerRequest:null});
const worker = new Worker("image-upload",async (jobs) => {
    console.log(jobs.data)
},{
    connection
}) ;


