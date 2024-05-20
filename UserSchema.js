import mongoose from "mongoose";

const ProjectReferenceSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    isReadOnly: { type: Boolean, default: false },
    timeframe: {
        start: Date,
        end: Date
    },
    linkedDate: { type: Date, default: Date.now },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const UsersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    ownedProjects: [ProjectReferenceSchema],
    sharedProjects: [ProjectReferenceSchema],
    notes: String,
    lastLogin: Date,
    loginCount: [{
        number: Number,
        date: Date
    }],
    startDate: Date,
    status: {
        current: { type: String, default: 'active' },
        dateSet: {type: Date, default: Date.now},
    },
});

const User = mongoose.model('User', UsersSchema);
export default User;
