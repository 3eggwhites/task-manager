const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/expressapp');

const { userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db');
const Task = require('../src/models/task');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Test Task'
    })
    .expect(201);

    const task = await Task.findById(response.body._id);

    // Assert a new task is created and matches the description
    expect(task).not.toBeNull();
    expect(task).toMatchObject({
        description: 'Test Task',
        completed: false
    });
});

test('Should fetch tasks associated to a user', async () => {
    const response = await request(app).get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body.length).toBe(2);
});

test('Should not delete other users task', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

    const task = Task.findById(taskOne._id);
    
    // Assert task is present in database
    expect(task).not.toBeNull();
});

afterAll(async () => {
    await mongoose.disconnect();
});