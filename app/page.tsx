import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona para a página do dashboard ao acessar a raiz
  redirect('/dashboard');
}
