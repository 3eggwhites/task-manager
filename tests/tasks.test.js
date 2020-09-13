const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/expressapp');
const jwt = require('jsonwebtoken');

const { userOne, userTwo, userThree, taskOne, taskFour, setupDatabase } = require('./fixtures/db');
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

    expect(response.body.length).toBe(3);
});

test('Should not delete other users task', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

    const task = await Task.findById(taskOne._id);
    
    // Assert task is present in database
    expect(task).not.toBeNull();
});

test('Should not create task with invalid or no description', async () => {
    await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        completed: true
    })
    .expect(400);
});

test('Should not update task with invalid completed', async () => {
    await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        description: 'Invalid task',
        completed: 12
    })
    .expect(400);
});

test('Should delete users task', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    const task = await Task.findById(taskOne._id);
    
    // Assert task is deleyed from database
    expect(task).toBeNull();
});

test('Should not delete task if unauthenticated', async () => {
    await request(app).delete(`/tasks/${taskFour._id}`)
    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
    .send()
    .expect(401);

    const task = await Task.findById(taskFour._id);
    
    // Assert task is present in database
    expect(task).not.toBeNull();
});

test('Should not update other user\'s task', async () => {
    await request(app).patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        completed: true
    })
    .expect(404);

    const task = await Task.findById(taskOne._id);
    
    // Assert task is not updated
    expect(task.completed).toBeFalsy();
});

test('Should fetch user\'s task by id', async () => {
    const response = await request(app).get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    const task = await Task.findById(taskOne._id);
    
    // Assert task fetch is equal to db task
    expect(task.description).toBe(response.body.description);
});

test('Should not fetch user task by id if unauthenticated', async () => {
    const response = await request(app).get(`/tasks/${taskFour._id}`)
    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
    .send()
    .expect(401);
});

test('Should not fetch other user\'s task by id', async () => {
    await request(app).get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

    const task = await Task.findById(taskOne._id);
    
    // Assert task is present
    expect(task).not.toBeNull();
});

test('Should fetch only completed tasks', async () => {
    const response = await request(app).get(`/tasks?completed=true`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
    
    // Assert only completed task is present
    expect(response.body.length).toBe(1);
    expect(response.body[0].completed).toBeTruthy();
});

test('Should fetch only incompleted tasks', async () => {
    const response = await request(app).get(`/tasks?completed=false`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
    
    // Assert only incompleted task is present
    expect(response.body.length).toBe(2);
    response.body.forEach((task) => {
        expect(task.completed).toBeFalsy();
    })
});

test('Should fetch page tasks', async () => {
    let page = 0;
    let limit = 2;
    while (page <= 2) {
        const response = await request(app).get(`/tasks?limit=2&skip=${page}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
        
        // Assert pagination is working
        if (page === 0) {
            expect(response.body.length).toBe(2);
        } else if (page === 2) {
            expect(response.body.length).toBe(1);
        }
        page = page + limit;
    }
});

afterAll(async () => {
    await mongoose.disconnect();
});