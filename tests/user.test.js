const request = require('supertest')
const User = require('../src/models/user')
const app = require('../src/app')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

// afterEach() also available
beforeEach(setupDatabase)

test('Should Sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: "Mrinal Pandey",
        email: "mrinalmni@gmail.com",
        password: "Redhead123$"
    }).expect(201)
    
    // Assert that DB was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    
    // Assertions about the response
    // expect(response.body.user.name).toBe('TestUser1')
    expect(response.body).toMatchObject({
        user: {
            name: 'Mrinal Pandey'
        },
        token: user.tokens[0].token
    })

    // Assert user password is not stored as plain text
    expect(user.password).not.toBe('Redhead123$')
})

test('Should Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not Login non existent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'WrongPass12!'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should Update valid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: "TestUser2"
    })
    .expect(200)
    const user = await User.findById(userOne)
    expect(user.name).toEqual('TestUser2')
})

test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: "Bangalore"
    })
    .expect(400)
})