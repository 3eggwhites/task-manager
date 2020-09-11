const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const router = new express.Router();

const User = require('../models/user');
const { request } = require('express');

router.post('/users', async (req,res) => {
    
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user,token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }

});

router.post('/users/logout', auth, async (req,res) => {
    try {
        const user = req.user;
        user.tokens = user.tokens.filter((token) => {
            token.token !== req.token;
        });
        await user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/users/logoutall', auth, async (req,res) => {
    try {
        const user = req.user;
        user.tokens = [];
        await user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//This route is no longer required as it exposes other users data to whoever has a authentication token. 
// A new endpoint is created /users/me which returns only the authenticated users data
// router.get('/users', auth, async (req,res) => {
//     try {
//         const users = await User.find({});
//         res.send(users);
//     } catch (e) {
//         res.status(500).send(e);
//     }
// });

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user);
});

router.patch('/users/me', auth, async (req,res) => {
    const allowedProperties = ['name', 'password', 'age'];
    const propertiesForUpdate = Object.keys(req.body);
    
    const isUpdateAllowed = propertiesForUpdate.every((property) => {
        return allowedProperties.includes(property);
    });

    if (!isUpdateAllowed) {
        return res.status(400).send({error: 'Invalid Updates'});
    }
    // modified code to run mongoose middleware run consistently
    // in the auth middleware user is already authenticated and fetched so here we no longer need to fetch user from db
    try {
        const userToBeUpdated = req.user;
        const requestBody = req.body;
        propertiesForUpdate.forEach((property) => {
            userToBeUpdated[property] = requestBody[property];
        });
        await userToBeUpdated.save();
        res.send(userToBeUpdated);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// In multer configuration if we do not specify a destination 'dest' property then multer will store the file binary data in 'req.file.buffer' property
const upload = multer({
    limits: {
        fileSize: 3000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File type not supported'));
        }
        cb(undefined,true);
    }
});

//cb(new Error('File must be a pdf')); // to reject a file and throw an error
//cb(undefined, true); // to accept a file
//cb(undefined, false); // to silently reject a file

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).toBuffer();
    req.user.avatar.data = buffer;
    req.user.avatar.mimeType = req.file.mimetype;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error();
        }
        res.set('Content-Type', user.avatar.mimeType);
        res.send(user.avatar.data);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;
