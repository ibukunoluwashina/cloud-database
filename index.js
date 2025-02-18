const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.error("Could not connect to MongoDB...", err));

// Define Schema
const courseSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3 }
});

// Create Model
const Course = mongoose.model('Course', courseSchema);

// Routes
app.get('/', (req, res) => {
    res.send('Hello World !!!');
});

// Get all courses
app.get('/api/courses', async (req, res) => {
    const courses = await Course.find();
    res.send(courses);
});

// Get single course by ID
app.get('/api/courses/:id', async (req, res) => {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).send('Course not found.');
    res.send(course);
});

// Add a new course
app.post('/api/courses', async (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let course = new Course({ name: req.body.name });
    course = await course.save();
    res.send(course);
});

// Update a course
app.put('/api/courses/:id', async (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }

    const course = await Course.findByIdAndUpdate(id, { name: req.body.name }, { new: true });

    if (!course) return res.status(404).send('Course not found.');
    res.send(course);
});

// Delete a course
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }

    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).send('Course not found.');
    res.send(course);
});

// Validation function
function validateCourse(course) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(course);
}

// Server Setup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));