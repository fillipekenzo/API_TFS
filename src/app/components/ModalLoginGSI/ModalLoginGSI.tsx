import { Button, Col, Form, Modal, Row, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import Style from "./style.module.scss";
import InputComponent from "../Input/Input";

interface ModalLoginGSIProps {
  visible: any;
  setVisibleFalse: Function;
  showMessage?: boolean;
  onFinish: Function;
}

export default function ModalLoginGSI(props: ModalLoginGSIProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {}, [props.visible]);

  const onFinish = async (values: any) => {
    props.onFinish(values);
  };

  return (
    <>
      {props?.visible && (
        <div className={Style.modal}>
          <div className={Style.modalContent}>
            <div className={Style.warningContainer}>
              <b className={Style.warningText}>
                Fazer Login
              </b>
            </div>
            <Form
              form={form}
              className={Style.form}
              name="basic"
              wrapperCol={{ span: 24 }}
              labelCol={{ span: 24 }}
              autoComplete="off"
              onFinish={onFinish}
              onFinishFailed={(errorInfo) => {
                message.error('Por favor, preencha todos os campos obrigatórios.');
              }}
            >
              <div className={Style.CaixaTexto}>
                <div className={Style.content}>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={24}>
                      <Form.Item
                        className={Style.ItemCaixaTexto}
                        name="usuario"
                        rules={[{ required: true, message: "Insira o Nome de Usuário" }]}
                      >
                        <InputComponent
                          name="Nome de Usuário"
                          placeholder="Insira o Nome de Usuário"
                          form={form}
                          nameForm={"usuario"}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={24}>
                      <Form.Item
                        className={Style.ItemCaixaTexto}
                        name="senha"
                        rules={[{ required: true, message: "Insira sua Senha" }]}
                      >
                        <InputComponent
                          name="Senha"
                          placeholder="Insira sua Senha"
                          type="password"
                          form={form}
                          nameForm={"senha"}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className={Style.buttonContainer}>
                <Button
                  className={"buttonPrimaryOutline"}
                  onClick={() => props.setVisibleFalse(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className={"buttonPrimary"}
                  htmlType="submit"
                  loading={loading}
                >
                  Logar
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
