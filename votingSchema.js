import mongoose from 'mongoose';

const votingSchema = new mongoose.Schema({
    reason: String,
    message: String,
    email: String,
    timestamp: Date,
});

const Voting = mongoose.model('Voting', votingSchema);

export default Voting;
