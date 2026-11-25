// Tokens do design system Pode Fazer (marca/tokens.json): claro e escuro.
export interface Cores {
  amareloFita: string;
  amareloClaro: string;
  asfalto: string;
  ink: string;
  inkSuave: string;
  reboco: string;
  superficie: string;
  linha: string;
  linhaForte: string;
  verde: string;
  onVerde: string;
  verdeFundo: string;
  verdeTexto: string;
  vermelho: string;
  vermelhoFundo: string;
  vermelhoTexto: string;
  esperaTexto: string;
  veu: string;
}

export const CLARO: Cores = {
  amareloFita: '#FFC21A',
  amareloClaro: '#FFF1C7',
  asfalto: '#1C1F23',
  ink: '#1C1F23',
  inkSuave: '#5E6268',
  reboco: '#FAF7F0',
  superficie: '#FFFFFF',
  linha: '#E6E0D3',
  linhaForte: '#8E8A80',
  verde: '#107540',
  onVerde: '#FFFFFF',
  verdeFundo: '#E3F3EA',
  verdeTexto: '#0D6136',
  vermelho: '#C2362B',
  vermelhoFundo: '#FBE6E4',
  vermelhoTexto: '#A12C23',
  esperaTexto: '#6B4E00',
  veu: 'rgba(28,31,35,0.55)',
};

export const ESCURO: Cores = {
  ...CLARO,
  amareloClaro: '#3A3115',
  ink: '#F4F1EA',
  inkSuave: '#A8ACB2',
  reboco: '#15171A',
  superficie: '#1F2226',
  linha: '#33373D',
  linhaForte: '#7A7F86',
  verde: '#3FCB7E',
  onVerde: '#0E1A12',
  verdeFundo: '#16301F',
  verdeTexto: '#6FDC9E',
  vermelho: '#FF6B5E',
  vermelhoFundo: '#3A1D1A',
  vermelhoTexto: '#FF8E84',
  esperaTexto: '#FFD66B',
  veu: 'rgba(0,0,0,0.6)',
};

export const RAIO = { sm: 6, md: 12, lg: 20 };
export const ALVO = 52;

export const FONTE = {
  display700: 'Archivo_700Bold',
  display800: 'Archivo_800ExtraBold',
  sans400: 'Inter_400Regular',
  sans500: 'Inter_500Medium',
  sans600: 'Inter_600SemiBold',
  sans700: 'Inter_700Bold',
};
