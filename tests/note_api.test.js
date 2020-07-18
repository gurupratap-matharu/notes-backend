const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')
const helper = require('./test_helper')

beforeEach(async () => {
    await Note.deleteMany({})

    const noteObjects = helper.initialNotes
        .map(note => new Note(note))
    const promiseArray = noteObjects.map(note => note.save())
    await Promise.all(promiseArray)
})

describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {

        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')

        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(r => r.content)
        expect(contents).toContain(
            'Browser can execute only Javascript'
        )
    })
})

describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToView = notesAtStart[0]

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(resultNote.body).toEqual(noteToView)
    })

    test('fails with statuscode 404 if note does not exists', async () => {

        const notesAtStart = await helper.notesInDb()
        const nonExistingId = await helper.nonExistingId()

        await api
            .get(`/api/notes/${nonExistingId}`)
            .expect(404)

        const notesAtEnd = await helper.notesInDb()

        expect(notesAtEnd).toHaveLength(notesAtStart.length)
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length)

    })

    test('fails with statuscode 400 if id is invalid', async () => {
        const invalidId = '4dwgw3463tbdfgret3456346f'

        await api
            .get(`/api/notes/${invalidId}`)
            .expect(400)

    })

})

describe('addition of a new note', () => {

    test('succeeds with valid data', async () => {
        const notesAtStart = await helper.notesInDb()
        const newNote = {
            content: 'async/await is cool',
            important: true,
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const notesAtEnd = await helper.notesInDb()

        expect(notesAtEnd).toHaveLength(notesAtStart.length + 1)
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

        const contents = notesAtEnd.map(note => note.content)

        expect(contents).toContain(newNote.content)

    })

    test('fails with statuscode 400 is data invalid', async () => {

        const notesAtStart = await helper.notesInDb()

        const invalidNote = {
            content: '',
            important: false
        }
        await api
            .post('/api/notes')
            .send(invalidNote)
            .expect(400)

        const notesAtEnd = await helper.notesInDb()

        expect(notesAtEnd).toHaveLength(notesAtStart.length)
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length)

        const contents = notesAtEnd.map(note => note.content)
        expect(contents).not.toContain(invalidNote.content)
    })

})

describe('deletion of a note', () => {
    test('succeds with statuscode 204 if id is valid', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToDelete = notesAtStart[0]

        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204)

        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(notesAtStart.length - 1)
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

        const contents = notesAtEnd.map(note => note.content)

        expect(contents).not.toContain(noteToDelete.content)
    })
})


afterAll(() => {
    mongoose.connection.close()
})