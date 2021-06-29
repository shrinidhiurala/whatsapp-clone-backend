import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors';

// app config
const app = express();
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: "1204563",
    key: "e964fef69c822786d8e4",
    secret: "db369151e2ac6a4408b7",
    cluster: "ap2",
    useTLS: true
});

//middleware
app.use(express.json())
app.use(cors())

// DB config
const mongooseURI = 'mongodb+srv://admin:whatsapp-clone-mern@cluster0.o9auq.mongodb.net/whatsappDB?retryWrites=true&w=majority'
mongoose.connect(mongooseURI,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.once('open', ()=>{
    console.log('DB is connected')

    const msgCollection = db.collection('messages')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change)=>{
        //console.log(change);
        if(change.operationType == 'insert'){
            const msgDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                _id: msgDetails._id,
                message: msgDetails.message,
                name: msgDetails.name,
                timestamp: msgDetails.timestamp,
                recived : msgDetails.recived
            });
        }else{
            console.log('Err while pushing')
        }
    })
})



//api rotes
app.get('/', (req,res)=> res.status(200).send('Yo, everything is working.'))

app.get('/messages/sync', (req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req,res)=>{
    const dbMessage = req.body
    Messages.create(dbMessage, (err, data) =>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

// listener
app.listen(port, ()=>console.log('listening on localhost'));