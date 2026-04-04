import { useEffect, useState } from "react";

function Dashboard() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [appointments, setAppointments] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [occupiedHours, setOccupiedHours] = useState([]);

  const allHours = [
    "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00"
  ];

  // 🔥 Cargar todas las citas
  const loadAppointments = () => {
    fetch("https://mi-saas-backend.onrender.com/appointments", {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // 🔥 Cuando selecciona fecha
  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime("");

    const res = await fetch(`https://mi-saas-backend.onrender.com/appointments/${date}`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    setOccupiedHours(data.map(a => a.time));
  };

  // 🔥 Crear cita
  const handleCreate = async (e) => {
    e.preventDefault();

    const response = await fetch("https://mi-saas-backend.onrender.com/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ name, date: selectedDate, time: selectedTime, notes })
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Cita creada");
      setName("");
      setNotes("");
      setSelectedTime("");
      loadAppointments();
    } else {
      alert("❌ " + data.message);
    }
  };

  // 🔥 Eliminar cita
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta cita?")) return;

    const response = await fetch(`https://mi-saas-backend.onrender.com/appointments/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });

    if (response.ok) {
      loadAppointments();
    }
  };

  // 🔥 Copiar link de reservas
  const handleCopyLink = () => {
    const link = `https://mi-saas-s-citas-jeferson.vercel.app/book/${userId}`;
    navigator.clipboard.writeText(link);
    alert("✅ Link copiado: " + link);
  };

  // 🔥 Cerrar sesión
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "/";
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📅 Mi Agenda</h1>
          <button
            onClick={handleCopyLink}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🔗 Copiar link de reservas
          </button>

          <button
  onClick={handleLogout}
  className="bg-red-100 hover:bg-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition"
>
  Cerrar sesión
</button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Nueva cita</h2>
          <form onSubmit={handleCreate} className="space-y-4">

            <input
              type="text"
              placeholder="Nombre del cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="date"
              onChange={handleDateChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Grilla de horas */}
            {selectedDate && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Selecciona una hora:</p>
                <div className="grid grid-cols-3 gap-2">
                  {allHours.map((hour) => {
                    const isOccupied = occupiedHours.includes(hour);
                    const isSelected = selectedTime === hour;
                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedTime(hour)}
                        className={`py-2 rounded-lg text-sm font-medium transition
                          ${isOccupied
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                      >
                        {isOccupied ? `${hour} ❌` : hour}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
            >
              Crear cita
            </button>

          </form>
        </div>

        {/* Lista de citas */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Mis citas</h2>

          {appointments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tienes citas todavía</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a._id} className="flex justify-between items-center border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                  <div>
                    <p className="font-semibold text-gray-800">{a.name}</p>
                    <p className="text-sm text-gray-500">📅 {a.date} &nbsp; 🕐 {a.time}</p>
                    {a.notes && <p className="text-sm text-gray-400 mt-1">📝 {a.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-500 px-3 py-1 rounded-lg text-sm font-medium transition"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;