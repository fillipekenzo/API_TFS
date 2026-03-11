import { GetServerSidePropsContext, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getAuthHeaders } from '../getAuthHeaders';
import { message } from 'antd';

export default async function fetchClient(input: RequestInfo | URL, init?: RequestInit, rotaProtegida = true, serverSide: boolean = false,
    contextServerSide?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>): Promise<any> {
    return new Promise(async (resolve, reject) => {

        const headers = { ...init?.headers, ...await getAuthHeaders(serverSide, rotaProtegida, contextServerSide), 'Cache-Control': 'no-cache' };
        let customInit: RequestInit = { ...init, headers: headers, };

        let res = await fetch(input, customInit)

        if (res.ok) {
            resolve(await res.json())
        }
        
        else if (res.status == 401 || res.status == 403) {
            let body = await res.json()
            message.error({
                key: 401,
                duration: 8,
                content: body.error?.length > 0 ? body.error[0] : "Falha na Autenticação"
            }
            )
            reject(body)

        }else if(res.status == 400){
            let body = await res.json()

            message.error({
                key: 400,
                duration: 8,
                content: body.error?.length > 0 ? body.error[0] : "Erro inesperado "
            }
            )
            reject(body)

        }

        else if (res.status == 500) {

            reject(res)
        }
        else {
            reject(await res.json())
        }
    })
}