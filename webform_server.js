import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import WebForm from './webFormSchema.js';
import Voting from './votingSchema.js';
import User from './UserSchema.js';
import Newsletter from './NewsletterSchema.js'; // Assuming you have a Newsletter schema
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3002;
app.use(cors()); // This should enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://unpzonapp:Y4zkPQECWbVEUb0e@cluster0.q8mkepv.mongodb.net/visapp?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Route for handling form submissions
app.post('/submit-form', (req, res) => {
    console.log('Submitting Form', req.body.message);
    const { name, email, message } = req.body;
    const newEntry = new WebForm({ name, email, message });

    newEntry.save()
        .then(() => res.send('Form data saved successfully!'))
        .catch(err => {
            console.error(err);
            res.status(400).send('Error saving data');
        });
});

// Route for handling votes
app.get('/vote', async (req, res) => {
    const { vote: message, reason, email = 'anonymous' } = req.query;

    if (message) {
        const newVote = new Voting({ reason, message, email });

        try {
            await newVote.save();
            console.log('Vote data saved successfully!');
            res.redirect('/thanks-for-voting.html');
        } catch (err) {
            console.error(err);
            res.status(400).send('Error saving data');
        }
    } else {
        res.status(400).send('No vote message provided');
    }
});

// Function to send the newsletter
const sendNewsletter = async (newsletterContent) => {
    if (!newsletterContent) {
        throw new Error('Newsletter content is missing');
    }

    const transporter = nodemailer.createTransport({
        service: 'zoho', // Replace with your email service
        auth: {
            user: 'hello@mookimoo.com', // Replace with your email
            pass: 'Sk1pper))' // Replace with your email password or an app-specific password
        }
    });

    try {
        // Uncomment the following line when you want to fetch all users from the database
        // const users = await User.find();

        // Use dummy data for testing
        const users = [
            {
                name: 'Brett Feeney',
                email: 'brettfeeney@gmail.com',
                ownedProjects: [{ name: 'Reginald' }, { name: 'Tomason' }]
            }
        ];

        for (const user of users) {
            const personalizedTemplate = newsletterContent
                .replace('{{userName}}', user.name)
                .replace('{{childNames}}', user.ownedProjects.map(p => p.name).join(', ')); // Adjust according to your schema

            const mailOptions = {
                from: 'hello@mookimoo.com',
                to: user.email,
                subject: 'MookiMoo App Update',
                html: personalizedTemplate
            };

            console.log(`Would send to: ${user.email}`);
            console.log(`Personalized content: ${personalizedTemplate}`);

            // Uncomment the following line to actually send the emails
            await transporter.sendMail(mailOptions);
            console.log(`Newsletter sent to ${user.email}`);
        }
    } catch (error) {
        console.error('Error processing newsletter:', error);
    }
};

// Endpoint to trigger the newsletter sending
app.post('/send-newsletter', async (req, res) => {
    const { content } = req.body; // Get the content from the request body

    try {
        await sendNewsletter(content);
        res.send('Newsletter processed successfully!');
    } catch (error) {
        console.error('Error processing newsletter:', error);
        res.status(500).send('Error processing newsletter');
    }
});

// Endpoint to get the latest newsletter
app.get('/newsletter/latest', async (req, res) => {
    try {
        const latestNewsletter = await Newsletter.findOne().sort({ date: -1 });
        if (latestNewsletter) {
            res.json({ content: latestNewsletter.content });
        } else {
            res.status(404).json({ message: 'No newsletter found' });
        }
    } catch (error) {
        console.error('Error fetching latest newsletter:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to save a newsletter
app.post('/newsletter/save', async (req, res) => {
    const { version, content } = req.body;

    try {
        const newNewsletter = new Newsletter({ version, content });
        await newNewsletter.save();
        res.json({ message: 'Newsletter saved successfully!', content: newNewsletter.content });
    } catch (error) {
        console.error('Error saving newsletter:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get the list of newsletter versions
app.get('/newsletter/versions', async (req, res) => {
    try {
        const versions = await Newsletter.find({}, { version: 1, date: 1 }).sort({ date: -1 });
        res.json(versions);
    } catch (error) {
        console.error('Error fetching newsletter versions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get a specific version of the newsletter
app.get('/newsletter/:version', async (req, res) => {
    const { version } = req.params;

    try {
        const newsletter = await Newsletter.findOne({ version });
        if (newsletter) {
            res.json(newsletter);
        } else {
            res.status(404).json({ message: 'Newsletter version not found' });
        }
    } catch (error) {
        console.error('Error fetching newsletter version:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
