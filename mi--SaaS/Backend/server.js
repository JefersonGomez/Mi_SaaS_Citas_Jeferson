// ===== 1. Cargar .env con diagnóstico =====
const dotenv = require('dotenv');
const result = dotenv.config({ path: '../.env' }); // Ajusta la ruta si es necesario

if (result.error) {
  console.error('❌ Error cargando .env:', result.error.message);
} else {
  console.log('✅ .env cargado');
}

// ===== 2. Debug: Verificar variables =====
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? '✅ Definida' : '❌ Undefined');
console.log('🔍 Primeros 20 chars de MONGO_URI:', process.env.MONGO_URI?.substring(0, 20) + '...');

// ===== 3. Dependencias =====
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// ===== 4. Conexión a MongoDB =====
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI no está definida');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => {
    console.error("❌ Error:", err.message);
    console.error("💡 Verifica: contraseña, IP permitida en Atlas, URI correcta");
  });

// ===== 5. Servidor =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});

