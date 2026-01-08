// backend/src/tests/student.validator.test.js

const {
  isValidCedula10Digits,
  isValidEmail,
  sanitizeStudentPayload,
  validateStudentPayload,
} = require("../validators/student.validator");

describe("Student Validator", () => {
  test("Cédula válida debe ser exactamente 10 dígitos", () => {
    expect(isValidCedula10Digits("0604860892")).toBe(true);
    expect(isValidCedula10Digits("604860892")).toBe(false);      // 9 dígitos
    expect(isValidCedula10Digits("06048608921")).toBe(false);    // 11 dígitos
    expect(isValidCedula10Digits("06048A0892")).toBe(false);     // letras
  });

  test("Email válido / inválido", () => {
    expect(isValidEmail("cmmolina2@espe.edu.ec")).toBe(true);
    expect(isValidEmail("ana.torres@mail.com")).toBe(true);

    expect(isValidEmail("cmmolina2@espe")).toBe(false);
    expect(isValidEmail("cmmolina2@.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  test("sanitize y validate retornan datos normalizados", () => {
    const raw = {
      cedula: " 0604860892 ",
      nombres: " Cristian ",
      apellidos: " Molina ",
      email: " CMMOLINA2@ESPE.EDU.EC ",
      telefono: " 032226677 ",
      estado: "activo",
      fecha_nacimiento: "",
    };

    const s = sanitizeStudentPayload(raw);
    expect(s.cedula).toBe("0604860892");
    expect(s.email).toBe("cmmolina2@espe.edu.ec");
    expect(s.estado).toBe("ACTIVO");
    expect(s.fecha_nacimiento).toBe(null);

    const v = validateStudentPayload(raw);
    expect(v.ok).toBe(true);
    expect(v.data.email).toBe("cmmolina2@espe.edu.ec");
  });
});
