"use client";
import { useState } from "react";
import { FaRocket, FaSpinner } from "react-icons/fa";
import { LogoSistema } from "./components/LogoSistema/LogoSistema";
import ModalLoginGSI from "./components/ModalLoginGSI/ModalLoginGSI";
import Styles from "./styles.module.scss";
import { useRouter } from "next/navigation";
import { encryptPassword } from "./utils/encryption";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleLoginSuccess = (values: any) => {
    // Salva o usuário na sessão com a senha criptografada
    if (typeof window !== "undefined") {
      const encryptedPassword = encryptPassword(values.senha);
      sessionStorage.setItem("tfs_user", JSON.stringify({
        usuario: values.usuario,
        senha: encryptedPassword,
      }));
      console.log("Usuário salvo na sessão:", values.usuario);
      console.log("Senha criptografada e salva na sessão");
    }
    setIsModalOpen(false);
    setLoading(true);
    router.push("/formulario");
  };

  return (
    <>
      <div className={Styles.body}>
        <div className={Styles.container}>
          <div className={Styles.left_section}>
            <div className={Styles.content_wrapper}>
              <h1 className={Styles.title}>
                Lançamento de <span className={Styles.highlight}>UST</span>
              </h1>
              <p className={Styles.texto}>
                Simplificando tarefas e acelerando resultados.
              </p>
              <button
                className={Styles.launch_button}
                onClick={handleClick}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className={Styles.spinner} />
                    Carregando...
                  </>
                ) : (
                  <>
                    <FaRocket />
                    Começe agora!
                  </>
                )}
              </button>
            </div>
            <footer className={Styles.footer}>
              <p>&copy; CSIC - Time G08</p>
            </footer>
          </div>
          <div className={Styles.right_section}>
            <div className={Styles.background_overlay}>
              <div className={Styles.logo_container}>
                <LogoSistema className={Styles.logoSistema} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalLoginGSI
        visible={isModalOpen}
        setVisibleFalse={() => setIsModalOpen(false)}
        onFinish={handleLoginSuccess}
      />
    </>
  );
}
