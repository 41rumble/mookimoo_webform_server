import mongoose from 'mongoose';

const webFormSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const WebForm = mongoose.model('WebForm', webFormSchema);

export default WebForm;
