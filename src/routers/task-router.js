const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();

const Task = require('../models/task');

router.post('/tasks', auth, async (req,res) => {
    const task = new Task({
        ...req.body, // javascript spread operator to copy all porperties of req.body to the task object
        createdBy: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// GET tasks?completed=true
// GET tasks?limit=10&skip=10
router.get('/tasks', auth, async (req,res) => {
    try {
        // for filtering based on completion status
        const match = {};
        if (req.query.completed) {
            match.completed = req.query.completed === 'true';
        }

        // for sorting
        const sort = {};
        let sortParams = [];
        sortParams = sortParams.concat(req.query.sortBy);
        if (req.query.sortBy) {
            sortParams.forEach((sortParam) => {
                const sortCriteria = sortParam.split('_');
                sort[sortCriteria[0]] = sortCriteria[1] === 'asc' ? 1 : -1;
            });
        }
        /**
         * when we call the populate method we populate details on the object itself, 
         * so we have to extract the information from the object after calling populate
         */
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        if (!req.user.tasks || req.user.tasks.length === 0) {
            return res.status(404).send();
        }
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id;
    try{
        //mongoose automatically converts string ids to ObjectID so we don't have to convert them explicitly.
        const task = await Task.findOne({ _id, createdBy: req.user._id })
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req,res) => {

    const allowedProperties = ['completed', 'description'];
    const propertiesForUpdate = Object.keys(req.body);

    const isUpdateAllowed = propertiesForUpdate.every((property) => {
        return allowedProperties.includes(property);
    });

    if (!isUpdateAllowed) {
        return res.status(400).send({error: 'Invalid Updates'});
    }

    const _id = req.params.id;
    const requestBody = req.body;
    try{
        //code changed to make mongoose behave consistently between create and update
        const taskTobeUpdated = await Task.findOne({ _id, createdBy: req.user._id });
        if (!taskTobeUpdated) {
            return res.status(404).send();
        }
        propertiesForUpdate.forEach((property) => {
            taskTobeUpdated[property] = requestBody[property];
        });
        await taskTobeUpdated.save();
        res.send(taskTobeUpdated);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;