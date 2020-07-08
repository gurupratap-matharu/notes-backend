require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/note')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))


app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
    Note
        .find({})
        .then(notes => {
            res.json(notes)
        })
})

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id)
        .then(note => {
            response.json(note)
        })
})

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (body.content === undefined) {
        return response.status(400).json({
            error: "content missing"
        })
    }

    const note = new Note({
        content: body.content,
        date: new Date(),
        important: body.important || false,
    })

    note
        .save()
        .then(savedNote => {
            response.json(savedNote)
        })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})

let PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})