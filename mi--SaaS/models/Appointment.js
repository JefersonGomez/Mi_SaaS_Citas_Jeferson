const mongose = require('mongoose');


const AppointmentSchema = new mongose.Schema({

userId : { type :String ,required :true},
name : String,
date :Date,
notes : String

})


module.exports = mongose.model('Appointment',AppointmentSchema);