import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fmtQtd, lerDinheiro, lerQtd, semRS } from '../lib/format';
import { ALVO, CLARO, Cores, ESCURO, FONTE, RAIO } from '../theme';
import { Icone, NomeIcone } from './Icone';

// ---------- tema ----------
const TemaContext = createContext<Cores>(CLARO);
export function TemaProvider({ children }: { children: React.ReactNode }) {
  const esquema = useColorScheme();
  return <TemaContext.Provider value={esquema === 'dark' ? ESCURO : CLARO}>{children}</TemaContext.Provider>;
}
export const useCores = () => useContext(TemaContext);

// ---------- aviso (toast) ----------
const AvisoContext = createContext<(msg: string) => void>(() => {});
export const useAviso = () => useContext(AvisoContext);
export function AvisoProvider({ children }: { children: React.ReactNode }) {
  const c = useCores();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mostrar = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2400);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <AvisoContext.Provider value={mostrar}>
      {children}
      {msg ? (
        <View pointerEvents="none" style={[st.avisoRaiz, { top: 12 + insets.top }]} accessibilityLiveRegion="polite">
          <View style={{ backgroundColor: c.ink, paddingVertical: 12, paddingHorizontal: 18, borderRadius: RAIO.md, maxWidth: 440 }}>
            <Text style={{ color: c.reboco, fontFamily: FONTE.sans600, fontSize: 14, textAlign: 'center' }}>{msg}</Text>
          </View>
        </View>
      ) : null}
    </AvisoContext.Provider>
  );
}

// ---------- texto ----------
export function Txt({ style, suave, peq, forte, num, children, ...rest }: React.ComponentProps<typeof Text> & { suave?: boolean; peq?: boolean; forte?: boolean; num?: boolean }) {
  const c = useCores();
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: forte ? FONTE.sans600 : FONTE.sans400, fontSize: peq ? 12 : 15, lineHeight: peq ? 17 : 20, color: suave ? c.inkSuave : c.ink },
        num && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function H1({ style, children }: { style?: StyleProp<TextStyle>; children: React.ReactNode }) {
  const c = useCores();
  return <Text accessibilityRole="header" style={[{ fontFamily: FONTE.display800, fontSize: 24, lineHeight: 28, color: c.ink }, style]}>{children}</Text>;
}
export function H2({ style, children }: { style?: StyleProp<TextStyle>; children: React.ReactNode }) {
  const c = useCores();
  return <Text accessibilityRole="header" style={[{ fontFamily: FONTE.display700, fontSize: 17, lineHeight: 22, color: c.ink }, style]}>{children}</Text>;
}

// ---------- tela ----------
export function Tela({ children, comBarra, rodape }: { children: React.ReactNode; comBarra?: boolean; rodape?: React.ReactNode }) {
  const c = useCores();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.reboco }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: comBarra ? 170 : 32 }}>
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', gap: 16 }}>{children}</View>
        </ScrollView>
        {rodape}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Topo({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44 }}>{children}</View>;
}

/** Barra fixa embaixo: total, botões ou navegação. */
export function BarraFixa({ children }: { children: React.ReactNode }) {
  const c = useCores();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: c.superficie, borderTopWidth: 1, borderTopColor: c.linha, paddingTop: 12, paddingBottom: 16 + insets.bottom, paddingHorizontal: 16 }}>
      <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', gap: 10 }}>{children}</View>
    </View>
  );
}

export function NavInferior({ atual, ir }: { atual: 'inicio' | 'servicos' | 'perfil'; ir: (t: 'inicio' | 'servicos' | 'perfil') => void }) {
  const c = useCores();
  const b = (t: 'inicio' | 'servicos' | 'perfil', icone: NomeIcone, nome: string) => {
    const ativo = atual === t;
    return (
      <Pressable key={t} onPress={() => ir(t)} accessibilityRole="button" accessibilityState={{ selected: ativo }} style={{ flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Icone nome={icone} color={ativo ? c.ink : c.inkSuave} />
        <Text style={{ fontFamily: ativo ? FONTE.sans700 : FONTE.sans500, fontSize: 12, color: ativo ? c.ink : c.inkSuave }}>{nome}</Text>
      </Pressable>
    );
  };
  return (
    <BarraFixa>
      <View style={{ flexDirection: 'row' }}>
        {b('inicio', 'casa', 'Início')}
        {b('servicos', 'raio', 'Meus serviços')}
        {b('perfil', 'pessoa', 'Perfil')}
      </View>
    </BarraFixa>
  );
}

// ---------- botões ----------
export type Variante = 'principal' | 'verde' | 'contorno' | 'perigo' | 'tracejado';
export function Botao({ children, onPress, variante = 'principal', grande, icone, largura, style, desativado }: {
  children: React.ReactNode;
  onPress: () => void;
  variante?: Variante;
  grande?: boolean;
  icone?: NomeIcone;
  largura?: boolean;
  desativado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useCores();
  const v: Record<Variante, { bg: string; fg: string; borda: string; fonte: string; tam: number; tracejado?: boolean }> = {
    principal: { bg: c.amareloFita, fg: c.asfalto, borda: 'transparent', fonte: FONTE.display800, tam: grande ? 18 : 17 },
    verde: { bg: c.verde, fg: c.onVerde, borda: 'transparent', fonte: FONTE.display800, tam: 16 },
    contorno: { bg: 'transparent', fg: c.ink, borda: c.ink, fonte: FONTE.sans600, tam: 15 },
    perigo: { bg: 'transparent', fg: c.vermelho, borda: c.vermelho, fonte: FONTE.sans600, tam: 15 },
    tracejado: { bg: 'transparent', fg: c.ink, borda: c.linhaForte, fonte: FONTE.sans600, tam: 15, tracejado: true },
  };
  const e = v[variante];
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          minHeight: variante === 'tracejado' ? 44 : grande ? 56 : ALVO,
          borderRadius: RAIO.md,
          borderWidth: 1.5,
          borderStyle: e.tracejado ? 'dashed' : 'solid',
          borderColor: e.borda,
          backgroundColor: pressed ? (variante === 'tracejado' ? c.amareloClaro : e.bg === 'transparent' ? c.linha : e.bg) : e.bg,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          opacity: desativado ? 0.5 : pressed && e.bg !== 'transparent' ? 0.92 : 1,
        },
        largura && { alignSelf: 'stretch' },
        style,
      ]}
    >
      {icone ? <Icone nome={icone} size={variante === 'verde' || variante === 'principal' ? 24 : 20} color={e.fg} /> : null}
      <Text style={{ color: e.fg, fontFamily: e.fonte, fontSize: e.tam }}>{children}</Text>
    </Pressable>
  );
}

export function BotaoTexto({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const c = useCores();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[{ minHeight: 36, paddingVertical: 4, justifyContent: 'center', alignSelf: 'flex-start' }, style]}>
      <Text style={{ color: c.ink, fontFamily: FONTE.sans600, fontSize: 12, textDecorationLine: 'underline' }}>{children}</Text>
    </Pressable>
  );
}

export function BotaoIcone({ icone, onPress, rotulo, size = 24 }: { icone: NomeIcone; onPress: () => void; rotulo: string; size?: number }) {
  const c = useCores();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={rotulo} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: RAIO.md, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? c.linha : 'transparent' })}>
      <Icone nome={icone} size={size} color={c.ink} />
    </Pressable>
  );
}

// ---------- cartão, chips, status ----------
export function Cartao({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useCores();
  return <View style={[{ backgroundColor: c.superficie, borderWidth: 1, borderColor: c.linha, borderRadius: RAIO.md, paddingVertical: 14, paddingHorizontal: 16 }, style]}>{children}</View>;
}

export function Chip({ children, ativo, onPress, destaque }: { children: React.ReactNode; ativo?: boolean; onPress?: () => void; destaque?: boolean }) {
  const c = useCores();
  const estilo = {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center' as const,
    backgroundColor: ativo ? c.ink : destaque ? c.amareloClaro : c.superficie,
    borderColor: ativo ? c.ink : destaque ? c.amareloFita : c.linha,
  };
  const texto = <Text style={{ fontFamily: ativo || destaque ? FONTE.sans600 : FONTE.sans500, fontSize: 13, color: ativo ? c.reboco : c.ink }}>{children}</Text>;
  if (!onPress) return <View style={estilo}>{texto}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!ativo }} style={estilo}>
      {texto}
    </Pressable>
  );
}

export function Etiqueta({ status }: { status: 'esperando' | 'aprovado' | 'recusado' }) {
  const c = useCores();
  const m = { esperando: [c.amareloClaro, c.esperaTexto, 'Esperando'], aprovado: [c.verdeFundo, c.verdeTexto, 'Aprovado'], recusado: [c.vermelhoFundo, c.vermelhoTexto, 'Recusado'] }[status];
  return (
    <View style={{ backgroundColor: m[0], paddingVertical: 3, paddingHorizontal: 8, borderRadius: RAIO.sm }}>
      <Text style={{ color: m[1], fontFamily: FONTE.sans600, fontSize: 12 }}>{m[2]}</Text>
    </View>
  );
}

export function Exemplo() {
  const c = useCores();
  return (
    <View style={{ marginLeft: 6, borderWidth: 1, borderColor: c.linha, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
      <Text style={{ fontFamily: FONTE.sans700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.inkSuave }}>exemplo</Text>
    </View>
  );
}

export function Nota({ children }: { children: React.ReactNode }) {
  const c = useCores();
  return (
    <View style={{ backgroundColor: c.superficie, borderWidth: 1, borderStyle: 'dashed', borderColor: c.linhaForte, borderRadius: RAIO.md, paddingVertical: 10, paddingHorizontal: 12 }}>
      <Text style={{ fontFamily: FONTE.sans400, fontSize: 12, lineHeight: 17, color: c.inkSuave }}>{children}</Text>
    </View>
  );
}

// ---------- campos ----------
export function useEstiloEntrada(): TextStyle {
  const c = useCores();
  return { minHeight: ALVO, paddingHorizontal: 14, borderWidth: 1, borderColor: c.linhaForte, borderRadius: RAIO.sm, backgroundColor: c.superficie, fontSize: 15, fontFamily: FONTE.sans400, color: c.ink };
}

export function Entrada({ style, ...rest }: TextInputProps) {
  const c = useCores();
  const base = useEstiloEntrada();
  const [foco, setFoco] = useState(false);
  return (
    <TextInput
      placeholderTextColor={c.inkSuave}
      {...rest}
      onFocus={(e) => { setFoco(true); rest.onFocus?.(e); }}
      onBlur={(e) => { setFoco(false); rest.onBlur?.(e); }}
      style={[base, rest.multiline && { minHeight: 84, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top', lineHeight: 20 }, foco && { borderColor: c.amareloFita, borderWidth: 2 }, style]}
    />
  );
}

export function Campo({ rotulo, children, style }: { rotulo: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useCores();
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={{ fontFamily: FONTE.sans600, fontSize: 12, color: c.inkSuave }}>{rotulo}</Text>
      {children}
    </View>
  );
}

/** Campo de dinheiro: o que a pessoa digita fica no campo; ao sair, formata "12,50". Devolve centavos. */
export function EntradaDinheiro({ centavos, onChange, style, placeholder, rotulo, limpaAoAdicionar }: {
  centavos: number;
  onChange: (c: number) => void;
  style?: StyleProp<TextStyle>;
  placeholder?: string;
  rotulo: string;
  limpaAoAdicionar?: unknown;
}) {
  const [txt, setTxt] = useState(placeholder && !centavos ? '' : semRS(centavos));
  const foco = useRef(false);
  useEffect(() => {
    if (!foco.current) setTxt(placeholder && !centavos ? '' : semRS(centavos));
  }, [centavos, placeholder, limpaAoAdicionar]);
  return (
    <Entrada
      accessibilityLabel={rotulo}
      keyboardType="decimal-pad"
      placeholder={placeholder}
      value={txt}
      onFocus={() => { foco.current = true; }}
      onChangeText={(t) => { setTxt(t); onChange(lerDinheiro(t)); }}
      onBlur={() => { foco.current = false; setTxt(placeholder && !centavos ? '' : semRS(lerDinheiro(txt))); }}
      style={[{ fontVariant: ['tabular-nums'] }, style]}
    />
  );
}

/** Campo de quantidade (aceita vírgula). */
export function EntradaQtd({ qtd, onChange, rotulo }: { qtd: number; onChange: (q: number) => void; rotulo: string }) {
  const c = useCores();
  const [txt, setTxt] = useState(fmtQtd(qtd));
  const foco = useRef(false);
  useEffect(() => {
    if (!foco.current) setTxt(fmtQtd(qtd));
  }, [qtd]);
  // com o campo focado, "+" e "−" também precisam refletir: compara o valor lido com o atual
  useEffect(() => {
    if (lerQtd(txt) !== qtd) setTxt(fmtQtd(qtd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qtd]);
  return (
    <TextInput
      accessibilityLabel={rotulo}
      keyboardType="decimal-pad"
      value={txt}
      onFocus={() => { foco.current = true; }}
      onChangeText={(t) => { setTxt(t); onChange(lerQtd(t)); }}
      onBlur={() => { foco.current = false; setTxt(fmtQtd(lerQtd(txt))); }}
      style={{ width: 52, height: 40, textAlign: 'center', fontFamily: FONTE.sans700, fontSize: 14, color: c.ink, borderWidth: 1, borderColor: c.linhaForte, borderRadius: RAIO.sm, backgroundColor: c.superficie, paddingHorizontal: 4, fontVariant: ['tabular-nums'] }}
    />
  );
}

/** Campo de número inteiro (ex.: dias de validade): o que a pessoa digita fica no campo; ao sair, mostra o valor válido. */
export function EntradaInteiro({ valor, onChange, rotulo, style }: { valor: number; onChange: (n: number) => void; rotulo: string; style?: StyleProp<TextStyle> }) {
  const [txt, setTxt] = useState(String(valor));
  const foco = useRef(false);
  useEffect(() => {
    if (!foco.current) setTxt(String(valor));
  }, [valor]);
  return (
    <Entrada
      accessibilityLabel={rotulo}
      keyboardType="number-pad"
      value={txt}
      onFocus={() => { foco.current = true; }}
      onChangeText={(t) => { const limpo = t.replace(/\D/g, ''); setTxt(limpo); onChange(Math.max(1, parseInt(limpo, 10) || 15)); }}
      onBlur={() => { foco.current = false; setTxt(String(valor)); }}
      style={[{ fontVariant: ['tabular-nums'] }, style]}
    />
  );
}

/** Botões − e + (o + em amarelo). */
export function Passo({ onMenos, onMais, rotuloMenos, rotuloMais, children }: { onMenos: () => void; onMais: () => void; rotuloMenos: string; rotuloMais: string; children: React.ReactNode }) {
  const c = useCores();
  const base = { width: 38, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Pressable onPress={onMenos} accessibilityRole="button" accessibilityLabel={rotuloMenos} style={[base, { borderColor: c.linhaForte, backgroundColor: c.superficie }]}>
        <Text style={{ fontSize: 20, lineHeight: 22, color: c.ink }}>−</Text>
      </Pressable>
      {children}
      <Pressable onPress={onMais} accessibilityRole="button" accessibilityLabel={rotuloMais} style={[base, { borderColor: c.amareloFita, backgroundColor: c.amareloFita }]}>
        <Text style={{ fontSize: 20, lineHeight: 22, color: c.asfalto }}>+</Text>
      </Pressable>
    </View>
  );
}

// ---------- folha que sobe de baixo e diálogo ----------
export function Folha({ aberta, onFechar, children, rodape }: { aberta: boolean; onFechar: () => void; children: React.ReactNode; rodape: React.ReactNode }) {
  const c = useCores();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={aberta} transparent animationType="slide" onRequestClose={onFechar} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: c.veu, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onFechar} accessibilityLabel="Fechar" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', maxWidth: 520, maxHeight: '88%' }}>
          <View style={{ backgroundColor: c.reboco, borderTopLeftRadius: RAIO.lg, borderTopRightRadius: RAIO.lg, paddingTop: 10, paddingHorizontal: 16, maxHeight: '100%' }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.linhaForte, opacity: 0.6, alignSelf: 'center', marginBottom: 6 }} />
            <AvisoProvider>
              {children}
              <View style={{ paddingTop: 12, paddingBottom: 16 + insets.bottom, borderTopWidth: 1, borderTopColor: c.linha, gap: 8 }}>{rodape}</View>
            </AvisoProvider>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export interface DadosDialogo {
  titulo: string;
  texto: string;
  sim: string;
  fazer: () => void;
}
export function Dialogo({ dados, onFechar }: { dados: DadosDialogo | null; onFechar: () => void }) {
  const c = useCores();
  return (
    <Modal visible={!!dados} transparent animationType="fade" onRequestClose={onFechar} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: c.veu, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {dados ? (
          <View accessibilityViewIsModal style={{ backgroundColor: c.superficie, borderRadius: RAIO.lg, padding: 20, maxWidth: 380, width: '100%', gap: 14 }}>
            <H2>{dados.titulo}</H2>
            <Txt suave>{dados.texto}</Txt>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Botao variante="contorno" onPress={onFechar} style={{ flex: 1 }}>Voltar</Botao>
              <Botao variante="perigo" onPress={() => { const f = dados.fazer; onFechar(); f(); }} style={{ flex: 1 }}>{dados.sim}</Botao>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  avisoRaiz: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 100, paddingHorizontal: 16 },
});
