const API = "http://127.0.0.1:5050/api/students";


const form = document.getElementById("studentForm");
const tableBody = document.getElementById("tableBody");
const alertContainer = document.getElementById("alertContainer");

// Inputs
const idInput = document.getElementById("id");

const cedula = document.getElementById("cedula");
const nombres = document.getElementById("nombres");
const apellidos = document.getElementById("apellidos");
const email = document.getElementById("email");
const telefono = document.getElementById("telefono");
const estado = document.getElementById("estado");

// Botón del form (para cambiar texto a "Actualizar")
const submitBtn = document.getElementById("btnSubmit");


// Helpers UI
function showAlert(message, type = "success") {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function clearInvalid() {
  ["cedula", "nombres", "apellidos", "email"].forEach((id) => {
    document.getElementById(id).classList.remove("is-invalid");
  });
}

function ensureCancelButton() {
  let btnCancel = document.getElementById("btnCancel");

  if (!btnCancel) {
    btnCancel = document.createElement("button");
    btnCancel.id = "btnCancel";
    btnCancel.type = "button";
    btnCancel.className = "btn btn-secondary w-100 mt-2";
    btnCancel.textContent = "Cancelar edición";
    btnCancel.onclick = cancelEdit;
    submitBtn.insertAdjacentElement("afterend", btnCancel);
  }

  btnCancel.style.display = "block";
}

function hideCancelButton() {
  const btnCancel = document.getElementById("btnCancel");
  if (btnCancel) btnCancel.style.display = "none";
}

function cancelEdit() {
  form.reset();
  idInput.value = "";

  submitBtn.textContent = "Guardar";
  submitBtn.classList.remove("btn-warning");
  submitBtn.classList.add("btn-primary");

  hideCancelButton();
}



// Validaciones estrictas
function validateForm() {
  clearInvalid();

  const cedulaVal = cedula.value.trim();
  const emailVal = email.value.trim();
  const nombresVal = nombres.value.trim();
  const apellidosVal = apellidos.value.trim();

  if (!/^\d{10}$/.test(cedulaVal)) {
    cedula.classList.add("is-invalid");
    showAlert("La cédula debe tener exactamente 10 dígitos numéricos.", "danger");
    return false;
  }

  if (nombresVal.length < 2) {
    nombres.classList.add("is-invalid");
    showAlert("Los nombres deben tener mínimo 2 caracteres.", "danger");
    return false;
  }

  if (apellidosVal.length < 2) {
    apellidos.classList.add("is-invalid");
    showAlert("Los apellidos deben tener mínimo 2 caracteres.", "danger");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    email.classList.add("is-invalid");
    showAlert("El correo electrónico no tiene un formato válido.", "danger");
    return false;
  }

  return true;
}

// Listar
async function loadStudents() {
  try {
    const res = await axios.get(API);
    tableBody.innerHTML = "";

    res.data.forEach((s) => {
      tableBody.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${s.cedula}</td>
          <td>${s.nombres} ${s.apellidos}</td>
          <td>${s.email}</td>
          <td>${s.estado}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editStudent(${s.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Eliminar</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    showAlert("No se pudo cargar la lista. Verifica que el backend y MySQL estén corriendo.", "danger");
  }
}

// Cargar datos al formulario (EDIT)
async function editStudent(id) {
  try {
    console.log("EDIT CLICK -> id:", id);

    const res = await axios.get(`${API}/${id}`);
    const student = res.data;

    idInput.value = student.id;
    cedula.value = student.cedula;
    nombres.value = student.nombres;
    apellidos.value = student.apellidos;
    email.value = student.email;
    telefono.value = student.telefono ?? "";
    estado.value = student.estado;

    //
    submitBtn.textContent = "Actualizar";
    submitBtn.classList.remove("btn-primary");
    submitBtn.classList.add("btn-warning");

    ensureCancelButton();

    showAlert(`Editando estudiante ID ${id}. Realiza cambios y presiona "Actualizar".`, "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showAlert("Error al cargar datos para editar.", "danger");
    console.error(err);
  }
}




// Crear / Actualizar (POST o PUT según exista id)
form.onsubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    cedula: cedula.value.trim(),
    nombres: nombres.value.trim(),
    apellidos: apellidos.value.trim(),
    email: email.value.trim(),
    telefono: telefono.value.trim(),
    estado: estado.value
  };

  const id = idInput.value?.trim();

  try {
    if (id) {
      // UPDATE
      await axios.put(`${API}/${id}`, payload);
      showAlert("Estudiante actualizado correctamente.", "success");
    } else {
      // CREATE
      await axios.post(API, payload);
      showAlert("Estudiante creado correctamente.", "success");
    }

    // Reset form
    form.reset();
    idInput.value = "";
    clearInvalid();

    // Restaurar estado visual (Punto 4)
    submitBtn.textContent = "Guardar";
    submitBtn.classList.remove("btn-warning");
    submitBtn.classList.add("btn-primary");
    hideCancelButton(); // oculta el botón "Cancelar edición" si existe

    loadStudents();
  } catch (err) {
    if (err.response?.status === 409) {
      showAlert("Cédula o email duplicado. Usa valores diferentes.", "warning");
    } else if (err.response?.status === 404) {
      showAlert("No se encontró el estudiante para actualizar.", "warning");
    } else {
      showAlert("Error al guardar. Verifica backend/MySQL y los datos.", "danger");
    }
    console.error(err);
  }
};


// Delete con confirmación
async function deleteStudent(id) {
  const ok = confirm(`¿Seguro que deseas eliminar el estudiante con ID ${id}?`);
  if (!ok) return;

  try {
    await axios.delete(`${API}/${id}`);
    showAlert("Estudiante eliminado correctamente.", "info");
    loadStudents();
  } catch (err) {
    showAlert("No se pudo eliminar el estudiante.", "danger");
  }
}

// Exportar funciones al scope global (para onclick en HTML)
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

loadStudents();


