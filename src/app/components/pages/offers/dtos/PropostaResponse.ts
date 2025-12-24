export interface PropostaResponse {
    id: string,
    valor: number,
    dataHora: string,
    carroId: string,
    vendedorId: string,
    usuarioId: string,
    aceita: boolean,
    recusada: boolean
}