import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFlashMessage } from "/trabalho rogerio/frontend/trabalho/FlashMessageContext/FlashMessageContext";
import API_BASE_URL from "/trabalho rogerio/frontend/trabalho/configs";
import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const { showMessage } = useFlashMessage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || "Erro ao cadastrar.", "error");
        return;
      }

      showMessage(
        "Cadastro realizado! Ative sua conta pelo e-mail para fazer login.",
        "info"
      );
      navigate("/");
    } catch {
      showMessage("Erro de conexão com o servidor.", "error");
    }
  };

  return (
    <div className="auth-container">
      <button className="back-home-top" onClick={() => navigate("/")}>
        Voltar
      </button>

      <div className="auth-card">
        <h2>Criar Conta</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Cadastrar</button>
        </form>

        <p>
          <Link to="/">Já tem conta? Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
