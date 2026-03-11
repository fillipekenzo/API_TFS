import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { server } from "../config";
import { getCookie, hasCookie, setCookie } from "cookies-next";
import { getDiffMinutes } from "./date";
import Router, { NextRouter, useRouter } from "next/router";
import { redirect } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";

export const getAuthHeaders = async (
  serverSide = false,
  rotaProtegida = true,
  contextServerSide?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  request?: NextRequest
) => {
  let customHeaders = {};

  if (serverSide) {
    if (rotaProtegida && contextServerSide?.req?.cookies["token"]) {
      await renovarToken(
        contextServerSide.req.cookies["token"],
        (res: any) => {
          contextServerSide?.res?.setHeader("set-cookie", [
            `token=${JSON.stringify({
              access_token: res?.access_token,
              expiration: res?.expiration,
            })}; Max-Age=${res?.expirationSeconds}`,
          ]);
        },
        (res: any) => {
          customHeaders = { ...customHeaders, "Custom-Authorization": res };
        }
      );
    }
  } else {
    if (rotaProtegida && hasCookie("token")) {
      await renovarToken(
        getCookie("token"),
        (res: any) => {
          setCookie(
            "token",
            `${JSON.stringify({
              access_token: res?.access_token,
              expiration: res?.expiration,
            })}`,
            {
              path: "/",
              maxAge: res?.expirationSeconds,
              sameSite: true,
            }
          );
        },
        (res: any) => {
          customHeaders = { ...customHeaders, "Custom-Authorization": res };
        }
      );
    }
  }
  return customHeaders;
};

const renovarToken = async (
  cookie: any,
  setCookie: Function,
  setHeader: Function
) => {
  let token = JSON.parse(cookie);
  if (verificarNecessidadeRenovarToken(cookie)) {
    let result = await fetch(`${server}/api/Usuario/RenewToken`, {
      cache: "no-store",
      method: "POST",
      headers: { "Custom-Authorization": token?.access_token },
    });

    if (result.ok) {
      let data = await result.json();
      let body = data?.data;
      setCookie(body);
      setHeader(body?.access_token);
    }
  } else {
    setHeader(token?.access_token);
  }
};

const verificarNecessidadeRenovarToken = (cookie: any) => {
  let token = JSON.parse(cookie);
  const DATA_ATUAL = new Date();
  const DATA_EXPIRACAO_TOKEN = new Date(token.expiration);
  const MINUTOS_RESTANTES_EXPIRACAO_TOKEN = getDiffMinutes(
    DATA_ATUAL,
    DATA_EXPIRACAO_TOKEN
  );
  const MINUTOS_RESTANTES_PARA_EXECUTAR_RENEWTOKEN = 20;
  return (
    MINUTOS_RESTANTES_EXPIRACAO_TOKEN <=
    MINUTOS_RESTANTES_PARA_EXECUTAR_RENEWTOKEN
  );
};
