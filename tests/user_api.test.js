const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')

describe('where there is initially one user in the db', () => {

    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'veerplaying',
            name: 'Veerpratap Singh',
            password: 'testpass123',
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const userNames = usersAtEnd.map(user => user.username)
        expect(userNames).toContain(newUser.username)
        expect(response.body.username).toEqual(newUser.username)

    })

    test('creation fails with proper statuscode and message if username is already taken', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'rootuser',
            password: 'testpass123',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})