export type Status = 'esperando' | 'aprovado' | 'recusado';

export interface Servico {
  id: string;
  nome: string;
  /** preço em centavos */
  preco: number;
  un: string;
  cat: string;
}

export interface Item {
  tipo: 'servico' | 'material';
  catId?: string;
  nome: string;
  qtd: number;
  /** preço unitário em centavos */
  preco: number;
  un?: string;
}

export interface Orcamento {
  id: string;
  num: number;
  cliente: string;
  tel: string;
  criadoEm: number;
  status: Status;
  validade: number;
  /** desconto em centavos */
  desconto: number;
  /** null = usa as condições padrão do perfil */
  condicoes: string | null;
  itens: Item[];
  exemplo?: boolean;
}

export interface Perfil {
  nome: string;
  profissao: string;
  profissoes: string[];
  telefone: string;
  cidade: string;
  condicoes: string;
  exemplo?: boolean;
}

export interface Banco {
  v: 2;
  perfil: Perfil;
  catalogo: Servico[];
  proxNum: number;
  orcamentos: Orcamento[];
}
