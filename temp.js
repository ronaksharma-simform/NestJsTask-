import {Queue} from 'bullmq'

const queue = new Queue("image-upload");

async function addTask(){
    await queue.add("myJob",{
        message:"Task Added SucessFully"
    })
}
setInterval(async ()=>{
    await addTask()
},1000)