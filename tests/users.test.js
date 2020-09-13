const request = require('supertest');
const app = require('../src/expressapp');
const mongoose = require('mongoose')

const { userOneId, userOne, userThree, setupDatabase } = require('./fixtures/db');
const User = require('../src/models/user');

beforeEach(setupDatabase);

test('Should signup user', async () => {
    const response = await request(app).post('/users')
    .send({
        name: 'Ayan',
        email: 'ayan@lazydeveloper.dev',
        password: 'Testpass@345!'
    }).expect(201);

    // Assert db records changed successfully
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assert user has same name 2 ways to do it uncommented way is better
    // expect(response.body.user.name).toBe('Ayan');
    expect(response.body).toMatchObject({
        user: {
            name: 'Ayan',
            email: 'ayan@lazydeveloper.dev'
        }
    });

    expect(user.password).not.toBe('Testpass@345!');
});

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login')
    .send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);

    // Asserting a new login token is generated and matches up with what stored in db
    expect(user.tokens.length).toBe(2); //when creating user one token is already created. when logging in a new token should be created
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existing user', async () => {
    await request(app).post('/users/login')
    .send({
        email: 'abc@def.com',
        password: userOne.password
    }).expect(400);
});

test('Should get user profile', async () => {
    await request(app).get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get user profile for un-authenticated user', async () => {
    await request(app).get('/users/me')
    .send()
    .expect(401);
});

test('Should delete account user', async () => {
    const response = await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    const user = await User.findById(userOneId);

    // Assert user is actually deleted
    expect(user).toBeNull();
});

test('Should not allow delete account to unauthenticated user', async () => {
    await request(app).delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload profile pciture', async () => {
    await request(app).post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpeg')
    .expect(200);

    const user = await User.findById(userOneId);

    // Asserting avatar data has buffer or not
    expect(user.avatar.data).toEqual(expect.any(Buffer));
});

test('Should allow user to update valid fields', async ()=> {
    const response = await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'UpdatedName',
        age: 20
    })
    .expect(200);

    const user = await User.findById(response.body.user._id);

    // Asserting changes are recorded in database
    expect(response.body.user).toMatchObject({
        name: 'UpdatedName',
        age: 20
    });
});

test('Should not allow user to update invalid fields', async ()=> {
    const response = await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Home',
        age: 20
    })
    .expect(400);
});

test('Should not signup user with invalid name/email/password', async () => {
    const response = await request(app).post('/users')
    .send({
        name: 'Ayan',
        email: 'ayanlazydeveloper.dev',
        password: 'Testpass@345!'
    }).expect(400);
});

test('Should not update user if unauthenticated', async () => {
    await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
    .send({
        name: 'updated'
    }).expect(401);

    const user = await User.findById(userThree._id);

    // Assert details did not change in db
    expect(user.name).not.toBe('updated')
});

test('Should not update user if unauthenticated', async ()=> {
    await request(app).patch('/users/me')
    .send({
        name: 'UpdatedName',
        age: 20
    })
    .expect(401);
});

test('Should not update user with invalid name/email/password', async ()=> {
    await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        password: 'pass'
    })
    .expect(500);
});


afterAll(async () => {
    await mongoose.disconnect();
});