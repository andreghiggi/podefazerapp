// Listas iniciais por profissão. Preços de exemplo (em centavos): o profissional ajusta e o app aprende.
// [nome, preço, unidade]
export type ModeloServico = [string, number, string?];

export const LISTAS: Record<string, ModeloServico[]> = {
  Eletricista: [
    ['Troca de tomada', 4500],
    ['Ponto de tomada novo', 9500],
    ['Instalação de interruptor', 4000],
    ['Instalação de chuveiro', 12000],
    ['Troca de resistência do chuveiro', 6000],
    ['Instalação de luminária', 6000],
    ['Ventilador de teto', 15000],
    ['Troca de disjuntor', 8000],
    ['Montagem de quadro de distribuição', 45000],
    ['Visita técnica', 7000],
  ],
  Encanador: [
    ['Desentupimento de pia', 12000],
    ['Desentupimento de vaso sanitário', 15000],
    ['Troca de torneira', 6000],
    ['Troca de sifão', 5000],
    ['Conserto de vazamento', 9000],
    ['Troca de registro', 11000],
    ['Troca de reparo de válvula de descarga', 9000],
    ["Instalação de caixa d'água", 35000],
    ['Visita técnica', 7000],
  ],
  Pintor: [
    ['Pintura de parede', 2500, 'm²'],
    ['Pintura de teto', 2800, 'm²'],
    ['Massa corrida', 1800, 'm²'],
    ['Textura', 3500, 'm²'],
    ['Pintura de porta', 12000],
    ['Pintura de grade ou portão', 4000, 'm²'],
    ['Diária', 25000, 'diária'],
  ],
  Pedreiro: [
    ['Assentamento de piso', 4500, 'm²'],
    ['Assentamento de revestimento', 5000, 'm²'],
    ['Reboco', 3500, 'm²'],
    ['Contrapiso', 3000, 'm²'],
    ['Levantar parede de bloco', 6000, 'm²'],
    ['Diária', 25000, 'diária'],
  ],
  'Técnico de ar-condicionado': [
    ['Instalação de split até 12.000 BTUs', 45000],
    ['Instalação de split acima de 12.000 BTUs', 60000],
    ['Limpeza e higienização', 18000],
    ['Recarga de gás', 25000],
    ['Manutenção preventiva', 20000],
    ['Desinstalação', 15000],
    ['Visita técnica', 8000],
  ],
};

export const PROFS = Object.keys(LISTAS);
