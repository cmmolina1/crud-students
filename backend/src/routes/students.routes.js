const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET - listar estudiantes
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET / error:", err);
    res.status(500).json({ message: "Error al listar estudiantes" });
  }
});

// GET - obtener estudiante por ID  ✅ /api/students/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET /:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - crear estudiante
router.post("/", async (req, res) => {
  try {
    const { cedula, nombres, apellidos, email, telefono, fecha_nacimiento, estado } = req.body;

    const [result] = await pool.query(
      `INSERT INTO students
      (cedula, nombres, apellidos, email, telefono, fecha_nacimiento, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cedula, nombres, apellidos, email, telefono, fecha_nacimiento ?? null, estado]
    );

    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Cédula o email duplicado" });
    }
    console.error("POST / error:", err);
    res.status(500).json({ message: "Error al crear estudiante" });
  }
});

// PUT - actualizar estudiante
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombres, apellidos, email, telefono, fecha_nacimiento, estado } = req.body;

    const [result] = await pool.query(
      `UPDATE students SET
        cedula=?, nombres=?, apellidos=?, email=?, telefono=?,
        fecha_nacimiento=?, estado=?
      WHERE id=?`,
      [cedula, nombres, apellidos, email, telefono, fecha_nacimiento ?? null, estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Cédula o email duplicado" });
    }
    console.error("PUT /:id error:", err);
    res.status(500).json({ message: "Error al actualizar estudiante" });
  }
});

// DELETE - eliminar estudiante
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM students WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /:id error:", err);
    res.status(500).json({ message: "Error al eliminar estudiante" });
  }
});

module.exports = router;

