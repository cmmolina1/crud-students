require("dotenv").config();
const express = require("express");
const cors = require("cors");

const studentsRoutes = require("./routes/students.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API CRUD Students OK");
});

app.use("/api/students", studentsRoutes);

const PORT = Number(process.env.PORT) || 5050;

// 🔒 BIND EXPLÍCITO A localhost (evita EACCES)
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Backend running on http://127.0.0.1:${PORT}`);
});

