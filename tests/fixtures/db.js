const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../src/expressapp');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'TestUser',
    email: 'test@user.com',
    password: 'whatthefish!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: 'TestUser2',
    email: 'test2@user.com',
    password: 'whatthefish!',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const userThreeId = new mongoose.Types.ObjectId();
const userThree = {
    _id: userThreeId,
    name: 'TestUser3',
    email: 'test3@user.com',
    password: 'whatthefish!3',
    tokens: [{
        token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    completed: false,
    createdBy: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: true,
    createdBy: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    completed: false,
    createdBy: userTwo._id
}

const taskFour = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Fourth Task',
    completed: false,
    createdBy: userThree._id
}

const taskFive = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Fifth Task',
    completed: false,
    createdBy: userOne._id
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new User(userThree).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
    await new Task(taskFour).save();
    await new Task(taskFive).save();

    await request(app).post('/users/logoutall')
    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
    .send()
    .expect(200);
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    userThree,
    taskOne,
    taskFour,
    setupDatabase
}