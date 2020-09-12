const request = require('supertest');
const app = require('../src/expressapp');
const User = require('../src/models/user');

const userOne = {
    name: 'TestUser',
    email: 'test@user.com',
    password: 'whatthefish!'
}

beforeEach(async ()=>{
    await User.deleteMany();
    await new User(userOne).save();
});

test('Should signup user', async () => {
    await request(app).post('/users').send({
        name: 'Ayan',
        email: 'ayan@lazydeveloper.dev',
        password: 'Testpass@345!'
    }).expect(201);
});

test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
});

test('Should not login non-existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'abc@def.com',
        password: userOne.password
    }).expect(400);
});