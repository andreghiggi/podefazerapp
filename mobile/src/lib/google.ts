// "Entrar com Google": usado só para preencher nome e e-mail no perfil. Nada é enviado a servidor nosso.
// O Android reconhece o app pelo pacote + assinatura cadastrados no Google Cloud (projeto "podefazer");
// por isso nenhum identificador precisa ficar no código.
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const googleDisponivel = true;

export interface ContaGoogle {
  nome: string;
  email: string;
}

/** null = a pessoa fechou a janela. Erro com mensagem pronta para mostrar. */
export async function entrarComGoogle(): Promise<ContaGoogle | null> {
  try {
    GoogleSignin.configure();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const r = await GoogleSignin.signIn();
    if (r.type !== 'success') return null;
    const u = r.data.user;
    // não mantém a sessão: na próxima vez a pessoa escolhe a conta de novo
    await GoogleSignin.signOut().catch(() => {});
    return { nome: u.name ?? '', email: u.email };
  } catch (e: unknown) {
    const codigo = String((e as { code?: unknown })?.code ?? '');
    if (codigo === statusCodes.SIGN_IN_CANCELLED || codigo === statusCodes.IN_PROGRESS) return null;
    if (codigo === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) throw new Error('Este celular não tem o Google Play Services.');
    throw new Error('Não foi possível entrar com o Google' + (codigo ? ` (código ${codigo})` : '') + '. Preencha os dados abaixo.');
  }
}
