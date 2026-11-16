const state = {
  token: localStorage.getItem("sb_token") || null,
  user: JSON.parse(localStorage.getItem("sb_user") || "null"),
  selectedInstallationId: null,
  selectedCourtId: null,
  weatherByInstallation: {},
};

const alertBox = document.getElementById("alert-box");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const userBar = document.getElementById("user-bar");
const userBadge = document.getElementById("user-badge");
const adminPanel = document.getElementById("admin-panel");

function showAlert(message, isError = false) {
  alertBox.textContent = message;
  alertBox.className = `rounded-lg p-4 text-sm font-medium border ${
    isError
      ? "bg-red-50 text-red-800 border-red-300"
      : "bg-emerald-50 text-emerald-800 border-emerald-300"
  }`;
  alertBox.classList.remove("hidden");
  setTimeout(() => alertBox.classList.add("hidden"), 5000);
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status}: ${data.error || "Error en la solicitud"}`);
  }
  return data;
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("sb_token", token);
  localStorage.setItem("sb_user", JSON.stringify(user));
  renderSessionUI();
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("sb_token");
  localStorage.removeItem("sb_user");
  renderSessionUI();
}

function renderSessionUI() {
  if (state.token && state.user) {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    userBar.classList.remove("hidden");
    userBar.classList.add("flex");
    userBadge.textContent = `${state.user.name} (${state.user.role})`;
    adminPanel.classList.toggle("hidden", state.user.role !== "ADMIN");
    loadAllData();
  } else {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    userBar.classList.add("hidden");
    adminPanel.classList.add("hidden");
  }
}

async function loadAllData() {
  await Promise.all([loadInstallations(), loadCourts(), loadTimeSlots(), loadReservations()]);
}

async function loadInstallations() {
  const listEl = document.getElementById("installations-list");
  const selectInst = document.getElementById("select-court-installation");
  const items = await apiFetch("/api/installations");

  selectInst.innerHTML = items.length
    ? items.map((i) => `<option value="${i._id}">${i.name}</option>`).join("")
    : `<option value="">Crea primero una instalación</option>`;

  if (!items.length) {
    listEl.innerHTML = `<p class="text-sm text-slate-500 col-span-3">No hay instalaciones registradas.</p>`;
    return;
  }

  listEl.innerHTML = items
    .map((inst) => {
      const w = state.weatherByInstallation[inst._id];
      const isSelected = state.selectedInstallationId === inst._id;
      return `
      <div class="p-4 rounded-lg border ${
        isSelected ? "border-blue-600 bg-blue-50/40" : "border-slate-200"
      } flex flex-col justify-between gap-3">
        <div>
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-bold text-sm">${inst.name}</h3>
            <span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              ${inst.latitude.toFixed(2)}, ${inst.longitude.toFixed(2)}
            </span>
          </div>
          <p class="text-xs text-slate-600 mt-1">${inst.address}</p>
          ${
            w
              ? `<div class="mt-3 p-2.5 rounded bg-sky-50 border border-sky-200 text-xs text-sky-900">
                   <p class="font-semibold">${w.condition} — ${w.temperatureC} °C</p>
                   <p class="text-[11px] text-sky-700">Humedad: ${w.humidityPercent}% · Viento: ${w.windSpeedKmh} km/h</p>
                 </div>`
              : ""
          }
        </div>
        <div class="flex gap-2 pt-2">
          <button onclick="selectInstallation('${inst._id}', '${inst.name.replace(/'/g, "\\'")}')"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-2 rounded">
            Ver canchas
          </button>
          <button onclick="fetchWeather('${inst._id}')"
            class="bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-medium py-1.5 px-2.5 rounded">
            Clima
          </button>
        </div>
      </div>`;
    })
    .join("");
}

window.selectInstallation = async (id, name) => {
  state.selectedInstallationId = id;
  state.selectedCourtId = null;
  document.getElementById("selected-inst-label").textContent = `Filtrando por sede: ${name}`;
  await Promise.all([loadInstallations(), loadCourts(), loadTimeSlots()]);
};

window.fetchWeather = async (installationId) => {
  try {
    const result = await apiFetch(`/api/installations/${installationId}/weather`);
    state.weatherByInstallation[installationId] = result.weather;
    await loadInstallations();
    showAlert(`Clima actualizado desde ${result.weather.provider}: ${result.weather.temperatureC} °C`);
  } catch (err) {
    showAlert(err.message, true);
  }
};

async function loadCourts() {
  const listEl = document.getElementById("courts-list");
  const selectCourt = document.getElementById("select-slot-court");
  const query = state.selectedInstallationId
    ? `?installationId=${state.selectedInstallationId}`
    : "";
  const items = await apiFetch(`/api/courts${query}`);

  const allCourts = state.selectedInstallationId ? await apiFetch("/api/courts") : items;
  selectCourt.innerHTML = allCourts.length
    ? allCourts
        .map((c) => `<option value="${c._id}">${c.name} (${c.sport.toUpperCase()})</option>`)
        .join("")
    : `<option value="">Crea primero una cancha</option>`;

  if (!items.length) {
    listEl.innerHTML = `<p class="text-sm text-slate-500">No hay canchas para esta selección.</p>`;
    return;
  }

  listEl.innerHTML = items
    .map((court) => {
      const instName = court.installationId?.name || "Sede";
      const isSelected = state.selectedCourtId === court._id;
      return `
      <div class="p-3 rounded-lg border ${
        isSelected ? "border-blue-600 bg-blue-50/40" : "border-slate-200"
      } flex justify-between items-center">
        <div>
          <p class="font-bold text-sm">${court.name}
            <span class="ml-1 text-xs uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">${court.sport}</span>
          </p>
          <p class="text-xs text-slate-500">${instName}</p>
        </div>
        <button onclick="selectCourt('${court._id}', '${court.name.replace(/'/g, "\\'")}')"
          class="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-medium">
          Ver horarios
        </button>
      </div>`;
    })
    .join("");
}

window.selectCourt = async (courtId, courtName) => {
  state.selectedCourtId = courtId;
  document.getElementById("selected-court-label").textContent = `Mostrando horarios de: ${courtName}`;
  await Promise.all([loadCourts(), loadTimeSlots()]);
};

async function loadTimeSlots() {
  const listEl = document.getElementById("timeslots-list");
  const query = state.selectedCourtId ? `?courtId=${state.selectedCourtId}` : "";
  const items = await apiFetch(`/api/time-slots${query}`);

  if (!items.length) {
    listEl.innerHTML = `<p class="text-sm text-slate-500">No hay horarios registrados.</p>`;
    return;
  }

  listEl.innerHTML = items
    .map((slot) => {
      const start = new Date(slot.startTime).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      });
      const end = new Date(slot.endTime).toLocaleTimeString("es-MX", { timeStyle: "short" });
      const courtName = slot.courtId?.name || "Cancha";
      const isPast = new Date(slot.startTime).getTime() <= Date.now();
      const canReserve = slot.status === "AVAILABLE" && !isPast;
      const visibleStatus = isPast ? "VENCIDO" : slot.status;

      const badgeColor =
        isPast
          ? "bg-slate-200 text-slate-700"
          : slot.status === "AVAILABLE"
          ? "bg-emerald-100 text-emerald-800"
          : slot.status === "RESERVED"
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800";

      return `
      <div class="p-3 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
        <div>
          <p class="font-semibold text-sm">${courtName}</p>
          <p class="text-xs text-slate-600">${start} — ${end}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold px-2 py-0.5 rounded ${badgeColor}">${visibleStatus}</span>
          ${
            canReserve
              ? `<button onclick="reserveSlot('${slot._id}')"
                   class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-semibold">
                   Reservar
                 </button>`
              : !isPast && slot.status === "RESERVED"
              ? `<button onclick="reserveSlot('${slot._id}')"
                   class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-2.5 py-1.5 rounded font-medium"
                   title="Probar validación 409 Conflict">
                   Probar 409
                 </button>`
              : ""
          }
        </div>
      </div>`;
    })
    .join("");
}

window.reserveSlot = async (timeSlotId) => {
  try {
    await apiFetch("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ timeSlotId }),
    });
    showAlert("Reservación confirmada exitosamente (201 Created)");
    await Promise.all([loadTimeSlots(), loadReservations()]);
  } catch (err) {
    showAlert(err.message, true);
  }
};

async function loadReservations() {
  const listEl = document.getElementById("reservations-list");
  const items = await apiFetch("/api/reservations");

  if (!items.length) {
    listEl.innerHTML = `<p class="text-sm text-slate-500">Aún no tienes reservaciones registradas.</p>`;
    return;
  }

  listEl.innerHTML = items
    .map((r) => {
      const slot = r.timeSlotId;
      const court = slot?.courtId;
      const inst = court?.installationId;
      const start = slot
        ? new Date(slot.startTime).toLocaleString("es-MX", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "Horario";

      const isConfirmed = r.status === "CONFIRMED";
      return `
      <div class="p-3.5 rounded-lg border border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div>
          <p class="font-bold text-sm">
            ${inst?.name || "Sede"} — ${court?.name || "Cancha"} (${court?.sport || ""})
          </p>
          <p class="text-xs text-slate-600">
            Horario: ${start} · Usuario: ${r.userId?.name || state.user.name}
          </p>
          ${
            r.cancelledAt
              ? `<p class="text-[11px] text-red-600 mt-0.5">Cancelada el: ${new Date(
                  r.cancelledAt
                ).toLocaleString("es-MX")}</p>`
              : ""
          }
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold px-2.5 py-1 rounded ${
            isConfirmed ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
          }">
            ${r.status}
          </span>
          ${
            isConfirmed
              ? `<button onclick="cancelReservation('${r._id}')"
                   class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-medium">
                   Cancelar
                 </button>`
              : ""
          }
        </div>
      </div>`;
    })
    .join("");
}

window.cancelReservation = async (id) => {
  try {
    await apiFetch(`/api/reservations/${id}/cancel`, { method: "PATCH" });
    showAlert("Reservación cancelada; el horario volvió a estado AVAILABLE");
    await Promise.all([loadTimeSlots(), loadReservations()]);
  } catch (err) {
    showAlert(err.message, true);
  }
};

// Eventos de formularios
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    saveSession(res.token, res.user);
    showAlert(`Bienvenido de vuelta, ${res.user.name}`);
  } catch (err) {
    showAlert(err.message, true);
  }
});

document.getElementById("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    saveSession(res.token, res.user);
    showAlert(`Cuenta creada exitosamente (${res.user.role})`);
  } catch (err) {
    showAlert(err.message, true);
  }
});

document.getElementById("btn-logout").addEventListener("click", () => {
  clearSession();
  showAlert("Sesión cerrada");
});

document.getElementById("btn-refresh-all").addEventListener("click", () => {
  state.selectedInstallationId = null;
  state.selectedCourtId = null;
  document.getElementById("selected-inst-label").textContent = "Mostrando todas las canchas";
  document.getElementById("selected-court-label").textContent =
    "Selecciona una cancha para filtrar sus horarios";
  loadAllData();
});

document.getElementById("form-installation").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await apiFetch("/api/installations", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        address: form.get("address"),
        latitude: Number(form.get("latitude")),
        longitude: Number(form.get("longitude")),
      }),
    });
    e.target.reset();
    showAlert("Instalación creada (201 Created)");
    await loadInstallations();
  } catch (err) {
    showAlert(err.message, true);
  }
});

document.getElementById("form-court").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await apiFetch("/api/courts", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    e.target.reset();
    showAlert("Cancha creada (201 Created)");
    await loadCourts();
  } catch (err) {
    showAlert(err.message, true);
  }
});

document.getElementById("form-timeslot").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const startDate = new Date(form.get("startLocal"));
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  try {
    await apiFetch("/api/time-slots", {
      method: "POST",
      body: JSON.stringify({
        courtId: form.get("courtId"),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      }),
    });
    e.target.reset();
    showAlert("Horario de 1 hora creado (201 Created)");
    await loadTimeSlots();
  } catch (err) {
    showAlert(err.message, true);
  }
});

renderSessionUI();
