import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import { Archivo_800ExtraBold } from '@expo-google-fonts/archivo/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AvisoProvider, DadosDialogo, Dialogo, TemaProvider, useAviso, useCores } from './src/components/ui';
import { capitalizar, juntarProfs, uid } from './src/lib/format';
import { ROTULO, mesclarLista, novoRascunho, ordenarItens } from './src/lib/orcamento';
import { BoasVindas } from './src/screens/BoasVindas';
import { Detalhe } from './src/screens/Detalhe';
import { Editor } from './src/screens/Editor';
import { FiltroLista, Inicio, TelaId } from './src/screens/Inicio';
import { Perfil } from './src/screens/Perfil';
import { Servicos } from './src/screens/Servicos';
import { BancoProvider, useBanco } from './src/store';
import { Orcamento, Perfil as PerfilT, Status } from './src/types';

type TelaApp = TelaId | 'editor' | 'detalhe';

function Raiz() {
  const c = useCores();
  const aviso = useAviso();
  const { db, mudar, zerar } = useBanco();
  const [tela, setTela] = useState<TelaApp>('inicio');
  const [filtro, setFiltro] = useState<FiltroLista>('todos');
  const [rascunho, setRascunho] = useState<Orcamento | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [recemFeito, setRecemFeito] = useState(false);
  const [dialogo, setDialogo] = useState<DadosDialogo | null>(null);
  const [escolhaProf, setEscolhaProf] = useState<string[]>([]);
  const [outraProf, setOutraProf] = useState('');

  const ir = (t: TelaApp) => {
    setTela(t);
    setRecemFeito(false);
  };
  const aberto = db.orcamentos.find((o) => o.id === abertoId) ?? null;
  const precisaBoasVindas = !db.perfil.profissoes || !db.perfil.profissoes.length;

  const setPerfil = (p: Partial<PerfilT>) => mudar((b) => ({ ...b, perfil: { ...b.perfil, ...p, exemplo: false } }));
  const atualizaRascunho = (fn: (r: Orcamento) => Orcamento) => setRascunho((r) => (r ? fn(r) : r));

  const novo = () => {
    setRascunho(novoRascunho(db.proxNum));
    ir('editor');
  };
  const abrir = (id: string) => {
    setAbertoId(id);
    ir('detalhe');
  };

  const cancelar = () => {
    const era = rascunho ? db.orcamentos.some((o) => o.id === rascunho.id) : false;
    setRascunho(null);
    if (era) setTela('detalhe');
    else ir('inicio');
  };

  const gerar = () => {
    if (!rascunho || !rascunho.itens.length) return;
    const r = { ...rascunho, itens: ordenarItens(rascunho.itens) };
    const existe = db.orcamentos.some((o) => o.id === r.id);
    mudar((b) =>
      existe
        ? { ...b, orcamentos: b.orcamentos.map((o) => (o.id === r.id ? r : o)) }
        : { ...b, orcamentos: b.orcamentos.concat(r), proxNum: Math.max(b.proxNum, r.num + 1) },
    );
    setRecemFeito(!existe);
    setAbertoId(r.id);
    setRascunho(null);
    setTela('detalhe');
    if (existe) aviso('Orçamento salvo');
  };

  const mudarStatus = (s: Status) => {
    if (!aberto) return;
    mudar((b) => ({ ...b, orcamentos: b.orcamentos.map((o) => (o.id === aberto.id ? { ...o, status: s } : o)) }));
    aviso(s === 'aprovado' ? 'O cliente disse "pode fazer"!' : 'Marcado como ' + ROTULO[s].toLowerCase());
  };

  const editar = () => {
    if (!aberto) return;
    setRascunho(JSON.parse(JSON.stringify(aberto)));
    ir('editor');
  };
  const duplicar = () => {
    if (!aberto) return;
    const copia: Orcamento = { ...JSON.parse(JSON.stringify(aberto)), id: uid(), num: db.proxNum, criadoEm: Date.now(), status: 'esperando', cliente: '', tel: '' };
    delete copia.exemplo;
    setRascunho(copia);
    ir('editor');
    aviso('Copiado. Troque o cliente e ajuste o que precisar.');
  };
  const excluir = () => {
    if (!aberto) return;
    const id = aberto.id;
    setDialogo({
      titulo: 'Excluir este orçamento?',
      texto: 'Ele some da lista e não dá para recuperar.',
      sim: 'Excluir',
      fazer: () => {
        mudar((b) => ({ ...b, orcamentos: b.orcamentos.filter((o) => o.id !== id) }));
        ir('inicio');
        aviso('Orçamento excluído');
      },
    });
  };

  const limparExemplos = () =>
    setDialogo({
      titulo: 'Apagar os exemplos?',
      texto: 'Os orçamentos de exemplo saem da lista e você escolhe sua profissão. A lista de serviços recomeça com os serviços da sua área.',
      sim: 'Apagar exemplos',
      fazer: () => {
        mudar((b) => ({
          ...b,
          orcamentos: b.orcamentos.filter((o) => !o.exemplo),
          perfil: { nome: b.perfil.exemplo ? '' : b.perfil.nome, profissao: '', profissoes: [], telefone: b.perfil.exemplo ? '' : b.perfil.telefone, cidade: '', condicoes: b.perfil.condicoes },
          catalogo: [],
          proxNum: b.orcamentos.some((o) => !o.exemplo) ? b.proxNum : 1,
        }));
        setEscolhaProf([]);
        setOutraProf('');
      },
    });

  const zerarTudo = () =>
    setDialogo({
      titulo: 'Apagar tudo?',
      texto: 'Some tudo deste aparelho: orçamentos, serviços e perfil. Volta ao começo com os exemplos.',
      sim: 'Apagar tudo',
      fazer: () => {
        zerar();
        setTela('inicio');
        setEscolhaProf([]);
        setOutraProf('');
      },
    });

  const comecar = () => {
    const profs = escolhaProf.slice();
    const outra = outraProf.trim();
    if (outra) profs.push(capitalizar(outra));
    if (!profs.length) {
      aviso('Escolha pelo menos uma profissão');
      return;
    }
    let qtd = 0;
    mudar((b) => {
      let cat = b.catalogo;
      profs.forEach((p) => {
        cat = mesclarLista(cat, p);
      });
      qtd = cat.length;
      return { ...b, catalogo: cat, perfil: { ...b.perfil, profissoes: profs, profissao: juntarProfs(profs), exemplo: false } };
    });
    setFiltro('todos');
    ir('inicio');
    aviso(qtd ? 'Pronto! Sua lista já tem ' + qtd + ' serviços para ajustar.' : 'Pronto! Sua lista vai se formando nos orçamentos.');
  };

  const addProf = (nome: string): boolean => {
    const n = capitalizar((nome || '').trim());
    if (!n) {
      aviso('Escreva o nome da profissão');
      return false;
    }
    if (db.perfil.profissoes.indexOf(n) >= 0) {
      aviso('Essa já está no seu perfil');
      return false;
    }
    const antes = db.catalogo.length;
    const depois = mesclarLista(db.catalogo, n).length;
    mudar((b) => {
      const profs = b.perfil.profissoes.concat(n);
      return { ...b, catalogo: mesclarLista(b.catalogo, n), perfil: { ...b.perfil, profissoes: profs, profissao: juntarProfs(profs) } };
    });
    aviso(depois > antes ? depois - antes + ' serviços de ' + n.toLowerCase() + ' entraram na sua lista' : n + ' adicionado ao perfil');
    return true;
  };

  // Botão "voltar" do Android: o editor volta ao orçamento/início; detalhe e abas voltam ao início.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dialogo) {
        setDialogo(null);
        return true;
      }
      if (tela === 'editor') {
        cancelar();
        return true;
      }
      if (tela !== 'inicio' && !precisaBoasVindas) {
        ir('inicio');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  });

  let conteudo: React.ReactNode;
  if (precisaBoasVindas) {
    conteudo = <BoasVindas perfil={db.perfil} escolha={escolhaProf} outra={outraProf} setEscolha={setEscolhaProf} setOutra={setOutraProf} setPerfil={setPerfil} comecar={comecar} />;
  } else if (tela === 'editor' && rascunho) {
    conteudo = (
      <Editor db={db} mudar={mudar} rascunho={rascunho} setRascunho={atualizaRascunho} editando={db.orcamentos.some((o) => o.id === rascunho.id)} cancelar={cancelar} gerar={gerar} />
    );
  } else if (tela === 'detalhe' && aberto) {
    conteudo = <Detalhe o={aberto} perfil={db.perfil} recemFeito={recemFeito} voltar={() => ir('inicio')} mudarStatus={mudarStatus} duplicar={duplicar} editar={editar} excluir={excluir} />;
  } else if (tela === 'servicos') {
    conteudo = <Servicos db={db} mudar={mudar} ir={ir} />;
  } else if (tela === 'perfil') {
    conteudo = <Perfil db={db} setPerfil={setPerfil} ir={ir} addProf={addProf} limparExemplos={limparExemplos} zerar={zerarTudo} />;
  } else {
    conteudo = <Inicio db={db} filtro={filtro} setFiltro={setFiltro} ir={ir} novo={novo} abrir={abrir} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.reboco }}>
      {conteudo}
      <Dialogo dados={dialogo} onFechar={() => setDialogo(null)} />
    </View>
  );
}

export default function App() {
  const [fontesOk] = useFonts({ Archivo_700Bold, Archivo_800ExtraBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontesOk) return <View style={{ flex: 1, backgroundColor: '#FFC21A' }} />;
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <BancoProvider carregando={<View style={{ flex: 1, backgroundColor: '#FFC21A' }} />}>
          <AvisoProvider>
            <Raiz />
            <StatusBar style="auto" />
          </AvisoProvider>
        </BancoProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}
