import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icone, Simbolo } from '../components/Icone';
import { BarraFixa, Botao, Campo, Cartao, Entrada, H1, H2, Tela, Topo, Txt, useAviso, useCores } from '../components/ui';
import { entrarComGoogle, googleDisponivel } from '../lib/google';
import { PROFS } from '../data/listas';
import { precisaServico, profCanonica } from '../lib/orcamento';
import { FONTE, RAIO } from '../theme';
import { Perfil } from '../types';

/** Grade de profissões (2 colunas), usada na boas-vindas. */
export function BotoesProf({ selecionadas, onToggle }: { selecionadas: string[]; onToggle: (p: string) => void }) {
  const c = useCores();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {PROFS.map((p) => {
        const on = selecionadas.indexOf(p) >= 0;
        return (
          <Pressable
            key={p}
            onPress={() => onToggle(p)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{ width: '48%', flexGrow: 1, minHeight: 50, borderRadius: RAIO.md, borderWidth: 1.5, borderColor: on ? c.amareloFita : c.linha, backgroundColor: on ? c.amareloClaro : c.superficie, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <Text style={{ flex: 1, fontFamily: FONTE.sans600, fontSize: 14, color: c.ink }}>{p}</Text>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: on ? c.amareloFita : c.linhaForte, backgroundColor: on ? c.amareloFita : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {on ? <Icone nome="ok" size={14} color={c.asfalto} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function BoasVindas({ perfil, escolha, outra, setEscolha, setOutra, primeiro, setPrimeiro, setPerfil, comecar }: {
  perfil: Perfil;
  escolha: string[];
  outra: string;
  setEscolha: (p: string[]) => void;
  setOutra: (t: string) => void;
  primeiro: { nome: string; preco: string };
  setPrimeiro: (p: { nome: string; preco: string }) => void;
  setPerfil: (p: Partial<Perfil>) => void;
  comecar: () => void;
}) {
  const c = useCores();
  const aviso = useAviso();
  const nova = profCanonica(outra);
  const [entrando, setEntrando] = React.useState(false);
  const google = async () => {
    setEntrando(true);
    try {
      const conta = await entrarComGoogle();
      if (conta) {
        // não apaga um nome que a pessoa já digitou (pode ser o nome da empresa)
        setPerfil({ email: conta.email, ...(perfil.nome.trim() ? {} : { nome: conta.nome }) });
        aviso('Conta ligada. Confira os dados e complete o telefone.');
      }
    } catch (e) {
      aviso(e instanceof Error ? e.message : 'Não foi possível entrar com o Google.');
    } finally {
      setEntrando(false);
    }
  };
  return (
    <Tela comBarra rodape={<BarraFixa><Botao largura onPress={comecar}>Começar</Botao></BarraFixa>}>
      <Topo>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Simbolo />
          <Text style={{ fontFamily: FONTE.display800, fontSize: 20, letterSpacing: -0.3, color: c.ink }}>Pode Fazer</Text>
        </View>
      </Topo>
      <View style={{ gap: 6 }}>
        <H1>Crie seu perfil</H1>
        <Txt suave>Esses dados aparecem no topo dos seus orçamentos e ficam guardados só neste celular.</Txt>
      </View>
      {googleDisponivel ? (
        <Botao variante="contorno" largura onPress={google} desativado={entrando}>{entrando ? 'Abrindo o Google…' : 'Entrar com Google'}</Botao>
      ) : null}
      {perfil.email ? <Txt peq suave>{'Conta: ' + perfil.email}</Txt> : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Campo rotulo="Seu nome ou da empresa" style={{ flex: 1 }}>
          <Entrada accessibilityLabel="Seu nome ou da empresa" value={perfil.nome} onChangeText={(t) => setPerfil({ nome: t })} />
        </Campo>
        <Campo rotulo="Telefone" style={{ flex: 1 }}>
          <Entrada accessibilityLabel="Telefone" value={perfil.telefone} onChangeText={(t) => setPerfil({ telefone: t })} keyboardType="phone-pad" />
        </Campo>
      </View>
      <View style={{ gap: 6 }}>
        <H1>Qual é o seu serviço?</H1>
        <Txt suave>Escolha um ou mais. O app já traz os serviços mais comuns da sua área com preços sugeridos para você ajustar.</Txt>
      </View>
      <BotoesProf selecionadas={escolha} onToggle={(p) => setEscolha(escolha.indexOf(p) >= 0 ? escolha.filter((x) => x !== p) : escolha.concat(p))} />
      <Campo rotulo="Outra profissão">
        <Entrada accessibilityLabel="Outra profissão" value={outra} onChangeText={setOutra} placeholder="Ex.: serralheiro, vidraceiro, jardineiro" />
      </Campo>
      {precisaServico([], nova) ? (
        <Cartao style={{ gap: 10 }}>
          <H2>{'Seu primeiro serviço de ' + nova.toLowerCase()}</H2>
          <Txt peq suave>Ainda não temos lista pronta para essa área. Cadastre pelo menos um serviço para começar; os outros você cria quando quiser.</Txt>
          <Campo rotulo="Nome do serviço">
            <Entrada accessibilityLabel="Nome do primeiro serviço" value={primeiro.nome} onChangeText={(t) => setPrimeiro({ ...primeiro, nome: t })} />
          </Campo>
          <Campo rotulo="Preço">
            <Entrada accessibilityLabel="Preço do primeiro serviço" value={primeiro.preco} onChangeText={(t) => setPrimeiro({ ...primeiro, preco: t })} keyboardType="decimal-pad" placeholder="R$ 0,00" />
          </Campo>
        </Cartao>
      ) : null}
    </Tela>
  );
}
