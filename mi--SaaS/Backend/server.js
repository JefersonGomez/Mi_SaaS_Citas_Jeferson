// ===== 1. Cargar variables de entorno =====
const dotenv = require('dotenv');
const result = dotenv.config({ path: '../.env' }); // ✅ Capturamos el resultado

if (result.error) {
  console.error('❌ Error cargando .env:', result.error.message);
} else {
  console.log('✅ .env cargado correctamente');
}

// ===== 2. Verificar variables críticas =====
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? '✅ Definida' : '❌ Undefined');
console.log('🔍 PORT:', process.env.PORT || '3000 (por defecto)');

// ===== 3. Dependencias =====
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // ✅ Ruta relativa correcta desde Backend/
const Appointment = require('./models/Appointment');
const auth = require("./middleware/auth");



const app = express();

// ===== 4. Middleware =====
app.use(cors());
app.use(express.json());

// ===== 5. Rutas =====

// 👉 Login (simplificado para pruebas)
const jwt = require("jsonwebtoken");

app.post('/login', async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email o contraseña incorrectos" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Email o contraseña incorrectos" });
    }

    // 🔥 CREAR TOKEN
   const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,  // ← aquí
  { expiresIn: "1h" }
);
//token para el frontend

    res.json({
      message: "Login correcto",
      token,
      userId:user._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 👉 Registro de usuario
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    // Verificar si el usuario ya existe
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear y guardar nuevo usuario
    const newUser = new User({
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    console.log('✅ Usuario registrado:', email);
    
    res.status(201).json({ message: "Usuario creado correctamente" });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      message: "Error en el servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
//autenticacin de json web token para proteger rutas


app.get("/dashboard", auth, (req, res) => {
  res.json({
    message: "Acceso permitido",
    user: req.user
  });
});

// 👉 Ruta de prueba para verificar conexión
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado' 
  });
});

// ruta para crear las citas del usuario

app.post("/appointments", auth, async (req, res) => {
  const { name, date, time, notes } = req.body;

  try {
    // 🔥 Verificar si ya existe una cita en esa fecha y hora
    const existing = await Appointment.findOne({ date, time });
    if (existing) {
      return res.status(400).json({ message: "Esa hora ya está ocupada" });
    }

    const newAppointment = new Appointment({
      userId: req.user.id,
      name,
      date,
      time,  // ← asegúrate de incluir time
      notes
    });

    await newAppointment.save();
    res.json({ message: "Cita creada correctamente" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear cita" });
  }
});

//ruta para obtener las citas del usuario

// 🔥 Obtener TODAS las citas del usuario
app.get("/appointments", auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

// 🔥 Obtener citas por fecha (para horas disponibles)
app.get("/appointments/:date", auth, async (req, res) => {
  const { date } = req.params;
  try {
    const appointments = await Appointment.find({
      userId: req.user.id,
      date
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

// ruta para eliminar cita
app.delete("/appointments/:id", auth, async (req,res)=>{
  try{
    const appointment = await Appointment.findById(req.params.id);

    if(!appointment){
      return res.status(404).json({message:"Cita no encontrada"});

    }

    if(appointment.userId.toString()!==req.user.id){
      return res.status(403).json({message:"No autorizado"});

    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({message:"Cita eliminada correctamente"});



  }catch(error){
    res.status(500).json({ message: "Error al eliminar la cita"})
  }
}
);
//ruta publica para recervar cita sin login osea para los usuarios
app.post("/book/:userId",async(req,res)=>{

  const {userId}=req.params;
  const {name,date,time,notes}=req.body;
  try{
    const existing = await Appointment.findOne({userId,date,time});
    if(existing){
      return res.status(400).json({message: "Esa hora ya esta ocupada"});
    }
    const newAppointment = new Appointment({
      userId,
      name,
      date,
      time,
      notes
    });
    
    await newAppointment.save();
    res.json({message:"Cita creada correctamente"});

  }catch(error){
    res.status(500).json({message:" Error al crear la cita"})
  }
});

// 🔥 Pública - horas ocupadas por fecha
app.get("/book/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  try {
    const appointments = await Appointment.find({ userId, date });
    const occupiedHours = appointments.map(a => a.time);
    res.json({ occupiedHours });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener disponibilidad" });
  }
});

// ===== 6. Conexión a MongoDB Y luego iniciar servidor =====
const PORT = process.env.PORT || 3000; // ✅ Usamos 5000 para backend

async function startServer() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');

    // Iniciar servidor SOLO después de conectar a la BD
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 Salud: http://localhost:${PORT}/api/health`);
    });

  } catch (err) {
    console.error('❌ Error fatal al iniciar:', err.message);
    console.error('💡 Verifica:');
    console.error('   - MONGO_URI en el archivo .env');
    console.error('   - Tu IP está permitida en MongoDB Atlas');
    console.error('   - La contraseña de la BD es correcta');
    process.exit(1); // Detener el proceso si no hay BD
  }
}

startServer();