import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "/trabalho rogerio/frontend/rogerio trab/UserContext";
import { useFlashMessage } from "/trabalho rogerio/frontend/rogerio trab/FlashMessageContext/FlashMessageContext";
import API_BASE_URL from "/trabalho rogerio/frontend/rogerio trab/configs";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const { showMessage } = useFlashMessage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      
      if (res.status === 403) {
        showMessage(
          "Ative sua conta pelo e-mail antes de fazer login."
        );
        return;
      }

      if (!res.ok) {
        showMessage(data.message || "Credenciais inválidas.", "error");
        return;
      }

      
      login({
        id: data.user.id,
        name: data.user.name,
        role: data.user.role || "user",
      });

      showMessage("Bem-vindo de volta!", "success");

      
      navigate("/boas-vindas");
    } catch {
      showMessage("Erro ao conectar com o servidor.", "error");
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Voltar
      </button>

      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <Link to="/recuperar-senha" className="login-link">
          Esqueci minha senha
        </Link>

        <Link to="/cadastro" className="login-link">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
