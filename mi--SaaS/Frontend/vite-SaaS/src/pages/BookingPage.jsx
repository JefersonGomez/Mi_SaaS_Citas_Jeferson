
import { useState } from "react";
import { useParams } from "react-router-dom";

function BookingPage() {
  const { userId } = useParams();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [occupiedHours, setOccupiedHours] = useState([]);
  const [success, setSuccess] = useState(false);

  const allHours = [
    "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00"
  ];

  // 🔥 Cuando selecciona fecha, cargar horas ocupadas
  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime("");

    const res = await fetch(`https://mi-saas-backend.onrender.com/book/${userId}/${date}`);
    const data = await res.json();
    setOccupiedHours(data.occupiedHours || []);
  };

  // 🔥 Crear reserva
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`https://mi-saas-backend.onrender.com/book/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date: selectedDate, time: selectedTime, notes })
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(true);
    } else {
      alert("❌ " + data.message);
    }
  };

  // 🔥 Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva confirmada!</h2>
          <p className="text-gray-500">Tu cita para el <b>{selectedDate}</b> a las <b>{selectedTime}</b> ha sido agendada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">📅 Reservar cita</h1>
        <p className="text-gray-400 text-sm mb-6">Elige una fecha y hora disponible</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="date"
            onChange={handleDateChange}
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Grilla de horas */}
          {selectedDate && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Horas disponibles:</p>
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
            Confirmar reserva
          </button>

        </form>
      </div>
    </div>
  );
}

export default BookingPage;


