const request = require('supertest');
const mongooes = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/expressapp');
const User = require('../src/models/user');


const userOneId = new mongooes.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'TestUser',
    email: 'test@user.com',
    password: 'whatthefish!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

beforeEach(async ()=>{
    await User.deleteMany();
    await new User(userOne).save();
});

test('Should signup user', async () => {
    const response = await request(app).post('/users').send({
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
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);

    // Asserting a new login token is generated and matches up with what stored in db
    expect(user.tokens.length).toBe(2); //when creating user one token is already created. when logging in a new token should be created
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existing user', async () => {
    await request(app).post('/users/login').send({
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