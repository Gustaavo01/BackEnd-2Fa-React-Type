const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();


app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: "*"
  })
);


const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);


app.get("/check-cookie", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Nenhum cookie encontrado" });
  res.json({ message: "Cookie JWT encontrado!", token });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB conectado"))
  .catch((err) => console.error(" Erro MongoDB:", err));


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(` Servidor rodando na porta ${PORT}`));
