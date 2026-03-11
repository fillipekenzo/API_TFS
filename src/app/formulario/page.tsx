import Header from "@/app/components/Header/Header";
import CadastrarTask from "../components/CadastrarTask/CadastrarTask";

function Formulario() {
  return (
    <>
      <Header></Header>
      <div className="containerApp">
        <CadastrarTask></CadastrarTask>
      </div>
    </>
  );
}

export default Formulario;
