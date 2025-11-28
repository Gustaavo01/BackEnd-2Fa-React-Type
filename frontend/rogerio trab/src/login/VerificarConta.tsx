import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "/trabalho rogerio/frontend/rogerio trab/configs";
import "./VerificarConta.css";

export default function VerificarConta() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verificando sua conta...");

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verificar/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus(data.message || "Link inválido ou expirado.");
          return;
        }

        setStatus(" Sua conta foi ativada com sucesso!");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setStatus("Erro ao verificar. Tente novamente.");
      }
    };
    verifyAccount();
  }, [token, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verificação de Conta</h2>
        <p>{status}</p>
        {status.includes("inválido") && (
          <button onClick={() => navigate("/cadastro")}>
            Fazer novo cadastro
          </button>
        )}
        {status.includes("ativada") && (
          <button onClick={() => navigate("/")}>Ir para login</button>
        )}
      </div>
    </div>
  );
}