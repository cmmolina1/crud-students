// backend/src/validators/student.validator.js

// ================================
// Constantes (REFACTOR)
// ================================
const CEDULA_REGEX = /^\d{10}$/;
//const CEDULA_REGEX = /^\d{9}$/; // mal a propósito

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ================================
// Validadores simples
// ================================
function isValidCedula10Digits(cedula) {
  const value = String(cedula ?? "").trim();
  return CEDULA_REGEX.test(value);
}

function isValidEmail(email) {
  const value = String(email ?? "").trim();
  return EMAIL_REGEX.test(value);
}

// ================================
// Sanitización
// ================================
function sanitizeStudentPayload(payload = {}) {
  return {
    cedula: String(payload.cedula ?? "").trim(),
    nombres: String(payload.nombres ?? "").trim(),
    apellidos: String(payload.apellidos ?? "").trim(),
    email: String(payload.email ?? "").trim().toLowerCase(),
    telefono: payload.telefono == null ? "" : String(payload.telefono).trim(),
    fecha_nacimiento:
      payload.fecha_nacimiento == null || payload.fecha_nacimiento === ""
        ? null
        : String(payload.fecha_nacimiento).trim(),
    estado: String(payload.estado ?? "ACTIVO").trim().toUpperCase(),
  };
}

// ================================
// Validación completa
// ================================
function validateStudentPayload(payload = {}) {
  const p = sanitizeStudentPayload(payload);

  if (!isValidCedula10Digits(p.cedula)) {
    return { ok: false, message: "La cédula debe tener exactamente 10 dígitos numéricos." };
  }

  if (p.nombres.length < 2) {
    return { ok: false, message: "Los nombres deben tener mínimo 2 caracteres." };
  }

  if (p.apellidos.length < 2) {
    return { ok: false, message: "Los apellidos deben tener mínimo 2 caracteres." };
  }

  if (!isValidEmail(p.email)) {
    return { ok: false, message: "El correo electrónico no tiene un formato válido." };
  }

  if (p.estado !== "ACTIVO" && p.estado !== "INACTIVO") {
    return { ok: false, message: 'El estado debe ser "ACTIVO" o "INACTIVO".' };
  }

  return { ok: true, data: p };
}

// ================================
// Exports
// ================================
module.exports = {
  isValidCedula10Digits,
  isValidEmail,
  sanitizeStudentPayload,
  validateStudentPayload,
};


