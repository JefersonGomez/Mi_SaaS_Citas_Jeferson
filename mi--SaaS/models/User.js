const mongose = require('mongoose');


const userSchema = new mongose.Schema({
    emais : { type :String ,required :true},
    password : { type :String ,required :true},
    plan :{ type: String , default:'basic'}
})

mopdule.exprts = mongose.model('User',userSchema);

