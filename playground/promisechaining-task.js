require('../src/db/mongoose');
const Task = require('../src/models/task');

// Task.findByIdAndRemove('5f536f6b4589851a4676c3d1').then((task) => {
//     console.log(task);
//     return Task.countDocuments({completed: true});
// }).then((count) => {
//     console.log(count);
// }).catch((error) => {
//     console.log(error);
// });

const deleteTaskAndCount = async (id,completed) => {
    const deletedTask = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({completed});
    return count;
}

deleteTaskAndCount('5f53ae8be22dcf4a041726f3', false).then((result) => {
    console.log('count '+result);
}).catch((error) => {
    console.log(error);
});