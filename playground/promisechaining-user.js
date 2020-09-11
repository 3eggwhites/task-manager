require('../src/db/mongoose');
const User = require('../src/models/user');

const updateNameReturnCount = (id,age) => {
    // 
    const user = await User.findByIdAndUpdate(id, {name: 'Zoro'});
    const count = await User.countDocuments({age});
    return count;
}

updateNameReturnCount ('5f53a963624da5472f8bec36', 32).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});