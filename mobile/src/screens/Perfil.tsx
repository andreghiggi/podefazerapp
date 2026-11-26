import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Botao, Campo, Cartao, Chip, Entrada, H1, H2, NavInferior, Nota, Tela, Txt } from '../components/ui';
import { PROFS } from '../data/listas';
import { lerDinheiro } from '../lib/format';
import { precisaServico, profCanonica } from '../lib/orcamento';
import { Banco, Perfil as PerfilT } from '../types';
import { TelaId } from './Inicio';

export function Perfil({ db, setPerfil, ir, addProf, zerar }: {
  db: Banco;
  setPerfil: (p: Partial<PerfilT>) => void;
  ir: (t: TelaId) => void;
  addProf: (nome: string, servico?: { nome: string; preco: number }) => boolean;
  zerar: () => void;
}) {
  const p = db.perfil;
  const [nova, setNova] = useState('');
  const [servNome, setServNome] = useState('');
  const [servPreco, setServPreco] = useState('');
  const pedeServico = precisaServico(db.catalogo, profCanonica(nova));
  const adicionar = () => {
    if (!addProf(nova, pedeServico ? { nome: servNome, preco: lerDinheiro(servPreco) } : undefined)) return;
    setNova(''); setServNome(''); setServPreco('');
  };
  const faltam = PROFS.filter((x) => p.profissoes.indexOf(x) < 0);

  return (
    <Tela comBarra rodape={<NavInferior atual="perfil" ir={ir} />}>
      <View style={{ gap: 4 }}>
        <H1>Perfil</H1>
        <Txt suave>Esses dados aparecem no topo de todo orçamento.</Txt>
      </View>

      <Campo rotulo="Seu nome ou da empresa">
        <Entrada accessibilityLabel="Seu nome ou da empresa" value={p.nome} onChangeText={(t) => setPerfil({ nome: t })} />
      </Campo>

      <Campo rotulo="E-mail (opcional)">
        <Entrada accessibilityLabel="E-mail" value={p.email ?? ''} onChangeText={(t) => setPerfil({ email: t })} keyboardType="email-address" autoCapitalize="none" />
      </Campo>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Campo rotulo="Como aparece no orçamento" style={{ flex: 1 }}>
          <Entrada accessibilityLabel="Como aparece no orçamento" value={p.profissao} onChangeText={(t) => setPerfil({ profissao: t })} />
        </Campo>
        <Campo rotulo="Telefone" style={{ flex: 1 }}>
          <Entrada accessibilityLabel="Telefone" value={p.telefone} onChangeText={(t) => setPerfil({ telefone: t })} keyboardType="phone-pad" />
        </Campo>
      </View>

      <Cartao style={{ gap: 10 }}>
        <H2>Suas profissões</H2>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {p.profissoes.map((x) => <Chip key={x} destaque>{x}</Chip>)}
        </View>
        {faltam.length ? (
          <>
            <Txt peq suave>Faz mais coisa? Toque para trazer os serviços dessa área para a sua lista:</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {faltam.map((x) => <Chip key={x} onPress={() => addProf(x)}>{'+ ' + x}</Chip>)}
            </View>
          </>
        ) : null}
        <View style={{ gap: 8, paddingTop: 4 }}>
          <Entrada value={nova} onChangeText={setNova} placeholder="Outra profissão" accessibilityLabel="Outra profissão" style={{ minHeight: 42, paddingHorizontal: 10, fontSize: 14 }} />
          {pedeServico ? (
            <>
              <Txt peq suave>Essa área é nova: cadastre o primeiro serviço dela.</Txt>
              <Entrada value={servNome} onChangeText={setServNome} placeholder="Nome do serviço" accessibilityLabel="Nome do primeiro serviço" style={{ minHeight: 42, paddingHorizontal: 10, fontSize: 14 }} />
              <Entrada value={servPreco} onChangeText={setServPreco} keyboardType="decimal-pad" placeholder="R$ 0,00" accessibilityLabel="Preço do primeiro serviço" style={{ minHeight: 42, paddingHorizontal: 10, fontSize: 14 }} />
            </>
          ) : null}
          <Botao variante="tracejado" icone="mais" largura onPress={adicionar}>Adicionar profissão</Botao>
        </View>
      </Cartao>

      <Campo rotulo="Condições padrão">
        <Entrada accessibilityLabel="Condições padrão" multiline value={p.condicoes} onChangeText={(t) => setPerfil({ condicoes: t })} />
      </Campo>

      <Nota>Tudo fica guardado só neste aparelho. Esta versão ainda não tem backup na nuvem: se trocar de celular, os orçamentos não vão junto.</Nota>

      <Botao variante="perigo" largura onPress={zerar}>Apagar tudo</Botao>
    </Tela>
  );
}

export { ScrollView };
