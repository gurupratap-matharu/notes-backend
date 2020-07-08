const mongoose = require('mongoose')
const { response } = require('express')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://testuser:${password}@cluster0.v5zhc.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
    content: 'Veer believe in yourself!',
    date: new Date(),
    important: true,
})

// note
//     .save()
//     .then(response => {
//         console.log('note saved!')
//         mongoose.connection.close()
//     })

Note.find({})
    .then(response => {
        response.forEach(note => {
            console.log(note)
        })
        mongoose.connection.close()
    })