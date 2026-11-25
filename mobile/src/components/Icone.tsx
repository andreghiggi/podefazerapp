import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type NomeIcone = 'voltar' | 'fechar' | 'mais' | 'casa' | 'raio' | 'pessoa' | 'busca' | 'zap' | 'copiar' | 'lapis' | 'lixo' | 'doc' | 'ok';

/** Ícones de traço do protótipo (24×24, traço 2.2, pontas arredondadas). */
export function Icone({ nome, size = 24, color }: { nome: NomeIcone; size?: number; color: string }) {
  const p = { stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let corpo: React.ReactNode = null;
  switch (nome) {
    case 'voltar': corpo = <Path d="M15 5l-7 7 7 7" {...p} />; break;
    case 'fechar': corpo = <Path d="M6 6l12 12M18 6 6 18" {...p} />; break;
    case 'mais': corpo = <Path d="M12 5v14M5 12h14" {...p} />; break;
    case 'ok': corpo = <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />; break;
    case 'casa': corpo = <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" {...p} />; break;
    case 'raio': corpo = <Path d="M13 2 4 14h7l-1 8 9-12h-7z" {...p} />; break;
    case 'pessoa': corpo = (<><Circle cx={12} cy={8} r={4} {...p} /><Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...p} /></>); break;
    case 'busca': corpo = (<><Circle cx={11} cy={11} r={7} {...p} /><Path d="m20 20-3.5-3.5" {...p} /></>); break;
    case 'zap': corpo = (<><Path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" {...p} /><Path d="M9 9.5c.3 2.5 2.5 4.7 5 5" {...p} /></>); break;
    case 'copiar': corpo = (<><Rect x={8} y={8} width={12} height={12} rx={2} {...p} /><Path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" {...p} /></>); break;
    case 'lapis': corpo = <Path d="M4 20h4L19 9l-4-4L4 16z" {...p} />; break;
    case 'lixo': corpo = <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" {...p} />; break;
    case 'doc': corpo = (<><Path d="M6 3h9l4 4v14H6z" {...p} /><Path d="M14 3v5h5" {...p} /></>); break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {corpo}
    </Svg>
  );
}

/** Balão com visto: o símbolo da marca. */
export function Simbolo({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M14 4h36a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H27l-13 9v-9a10 10 0 0 1-10-10V14A10 10 0 0 1 14 4z" fill="#FFC21A" />
      <Path d="M18.5 28.5l9 9 17.5-18" fill="none" stroke="#1C1F23" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
