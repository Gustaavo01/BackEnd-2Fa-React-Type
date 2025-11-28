const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");


const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL;


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post("/cadastro", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(" Requisição /cadastro recebida:", { name, email });

    if (!name || !email || !password)
      return res.status(400).json({ message: "Preencha todos os campos." });

    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.isVerified) {
      console.log(" Usuário existe, mas ainda não verificou. Reenviando e-mail...");
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const verifyLink = `${FRONTEND_URL}/verificar/${token}`;
      await transporter.sendMail({
        from: `"Trabalho Rogerio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reenvio - Ative sua conta Pro Trabalho",
        html: `<h2>Olá novamente, ${existingUser.name}!</h2>
               <p>Ative sua conta clicando abaixo:</p>
               <a href="${verifyLink}" target="_blank">Ativar conta</a>`,
      });

      return res.json({
        message: "Reenviamos o link de ativação para seu e-mail.",
      });
    }

    if (existingUser && existingUser.isVerified)
      return res.status(400).json({ message: "Usuário já existe e está ativo." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    await newUser.save();
    console.log(" Novo usuário criado:", newUser.email);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const verifyLink = `${FRONTEND_URL}/verificar/${token}`;

    await transporter.sendMail({
      from: `"Trabalho Rogerio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Ative sua conta na Loja Pijamas",
      html: `<h2>Olá, ${name}!</h2>
             <p>Ative sua conta clicando no link abaixo:</p>
             <a href="${verifyLink}" target="_blank">Ativar conta</a>`,
    });

    res.status(201).json({
      message: "Usuário cadastrado! Verifique seu e-mail para ativar a conta.",
    });
  } catch (err) {
    console.error(" Erro no cadastro:", err);
    res.status(500).json({ message: "Erro no servidor." });
  }
});


router.get("/verificar/:token", async (req, res) => {
  try {
    console.log(" Verificando token...");
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(400).json({ message: "Usuário não encontrado." });
    if (user.isVerified)
      return res.status(400).json({ message: "Conta já verificada." });

    user.isVerified = true;
    await user.save();
    console.log(" Conta verificada:", user.email);

    res.json({ message: "Conta ativada com sucesso!" });
  } catch (err) {
    console.error(" Erro na verificação:", err);
    res.status(400).json({ message: "Link inválido ou expirado." });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(" Tentando login:", email);

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      console.log("Login de administrador detectado.");
      const token = jwt.sign(
        { id: "admin-env", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000,
      });

      return res.json({
        user: {
          id: "admin-env",
          name: "Administrador",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
        },
        expiresAt: Date.now() + 2 * 60 * 60 * 1000,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(" E-mail não encontrado:", email);
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    if (!user.isVerified) {
      console.log(" Conta não verificada:", email);
      return res
        .status(403)
        .json({ message: "Verifique seu e-mail antes de entrar." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(" Senha incorreta para:", email);
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    console.log(" Login bem-sucedido:", email);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      expiresAt: Date.now() + 2 * 60 * 60 * 1000,
    });
  } catch (err) {
    console.error(" Erro no login:", err);
    res.status(500).json({ message: "Erro no servidor." });
  }
});


router.post("/logout", (req, res) => {
  console.log(" Logout realizado.");
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso." });
});


router.post("/recuperar-senha", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(" Pedido de recuperação:", email);

    if (!email) return res.status(400).json({ message: "Informe o e-mail." });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "E-mail não encontrado." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    const resetLink = `${FRONTEND_URL}/trocar-senha/${resetToken}`;
    console.log(" Link de reset gerado:", resetLink);

    await transporter.sendMail({
      from: `"Trabalho Rogerio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de senha",
      html: `<h2>Olá, ${user.name}</h2>
             <p>Clique no link abaixo para redefinir sua senha:</p>
             <a href="${resetLink}" target="_blank">Trocar senha</a>`,
    });

 

    res.json({ message: "E-mail de recuperação enviado com sucesso." });
  } catch (err) {
    console.error(" Erro em /recuperar-senha:", err);
    res.status(500).json({ message: "Erro ao enviar e-mail." });
  }
});


router.post("/trocar-senha/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;
    console.log(" Tentando trocar senha com token:", token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token inválido ou expirado." });

    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(" Senha trocada com sucesso:", user.email);

    
    await transporter.sendMail({
      from: `"Trabalho Rogerio" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Senha alterada com sucesso",
      html: `<h2>Olá, ${user.name}</h2>
             <p>Sua senha foi alterada com sucesso.</p>
             <p>Se você não fez essa alteração, entre em contato com o suporte imediatamente.</p>`,
    });

    res.json({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    console.error(" Erro em /trocar-senha:", err);
    res.status(500).json({ message: "Erro ao redefinir senha." });
  }
});


router.get("/me", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log(" Nenhum token encontrado.");
      return res.json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Usuário logado:", decoded);
    res.json({ user: decoded });
  } catch (err) {
    console.error(" Erro ao verificar /me:", err);
    res.json({ user: null });
  }
});

module.exports = router;