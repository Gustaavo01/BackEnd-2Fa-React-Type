import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "/trabalho rogerio/frontend/trabalho/configs";
import "./RecuperarSenha.css";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando e-mail...");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/recuperar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setStatus(data.message);

      if (res.ok) setTimeout(() => navigate("/login"), 4000);
    } catch {
      setStatus("Erro ao enviar e-mail. Tente novamente.");
    }
  };

  return (
    <div className="recover-container">
      <div className="recover-card">
        <h2>Recuperar senha</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar link</button>
        </form>
        <p className="status">{status}</p>
      </div>
    </div>
  );
}
