import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import WebForm from './webFormSchema.js'; // ES6 import
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://unpzonapp:Y4zkPQECWbVEUb0e@cluster0.q8mkepv.mongodb.net/visapp?retryWrites=true&w=majority');



app.post('/submit-form', (req, res) => {

    const { name, email, message } = req.body;
    console.log('Got Hit', name, email, message)
    const newEntry = new WebForm({ name, email, message });
    console.log('ENTRYt',newEntry)
    newEntry.save()
        .then(() => res.send('Form data saved successfully!'))
        .catch(err => {
            console.error(err);
            res.status(400).send('Error saving data');
        });
});
