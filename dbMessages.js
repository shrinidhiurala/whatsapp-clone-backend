import mongoose from 'mongoose'

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    recived: Boolean
})

export default mongoose.model('messages', whatsappSchema)