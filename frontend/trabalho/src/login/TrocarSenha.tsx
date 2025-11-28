import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API_BASE_URL from "/trabalho rogerio/frontend/rogerio trab/configs";
import "./TrocarSenha.css";

export default function TrocarSenha() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Alterando senha...");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/trocar-senha/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaSenha }),
      });

      const data = await res.json();
      setStatus(data.message);

      if (res.ok) setTimeout(() => navigate("/login"), 3000);
    } catch {
      setStatus("Erro ao alterar senha. Tente novamente.");
    }
  };

  return (
    <div className="change-container">
      <div className="change-card">
        <h2>Definir nova senha</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <button type="submit">Salvar nova senha</button>
        </form>
        <p className="status">{status}</p>
      </div>
    </div>
  );
}
