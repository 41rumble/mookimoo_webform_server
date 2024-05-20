import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
    version: { type: String, required: true },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
