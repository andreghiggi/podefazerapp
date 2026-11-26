// Na versão web não há login com Google.
export const googleDisponivel = false;

export interface ContaGoogle {
  nome: string;
  email: string;
}

export async function entrarComGoogle(): Promise<ContaGoogle | null> {
  return null;
}
