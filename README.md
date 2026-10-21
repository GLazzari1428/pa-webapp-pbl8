# Framework de decisão pós-MVP de iniciativas de IA — aplicação web (PBL8)

Aplicação web que substitui a planilha do "Framework de decisão pós-MVP de iniciativas de IA" (Grupo 14, Pesquisa Aplicada, PUCPR). Corresponde à Etapa 5 da DSR (Melhorias). Ela apoia a decisão de **Escalar**, **Pivotar** ou **Descontinuar** uma iniciativa de IA depois do MVP, seguindo as regras do artigo (`pbl6/artigo/main.tex`).

- 100% client-side: sem backend, sem banco de dados e sem variáveis de ambiente. Os casos ficam no `localStorage` do navegador.
- Fluxo em etapas: Configuração → Indicadores → Barreiras → Resultado → Decisão.
- Tutorial de onboarding obrigatório na primeira visita, com um link "Ver tutorial de novo" sempre visível.
- Exporta um caso em JSON (e importa de volta) e gera o resultado em PDF pela impressão do navegador ("Salvar como PDF").
- Traz carregáveis os três casos do artigo (Caso A, Conectahit e Squad de Negociação).

O que mudou em relação à planilha está em [`MELHORIAS.md`](./MELHORIAS.md).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui (Base UI) + recharts + lucide-react. Testes com Vitest.

## Como rodar

Requer Node.js 20 ou mais recente.

```bash
npm install      # instala as dependências
npm run dev      # servidor de desenvolvimento em http://localhost:3000
npm run build    # build de produção (precisa terminar sem erros)
npm start        # serve o build de produção localmente
npm test         # testes do motor de cálculo (Vitest)
npm run lint     # ESLint
```

## Estrutura

```
src/lib/engine/engine.ts     motor de cálculo único (puro, sem React)
src/lib/engine/decisions.ts  registro de decisão congelado e versionado
src/lib/engine/units.ts      unidades e leitura de números/percentuais
src/lib/engine/types.ts      modelo de dados (ids estáveis)
src/lib/data/examples.ts     os três casos da Tabela 2 do artigo
src/lib/storage.ts           persistência em localStorage, importação/exportação
src/lib/help.ts              textos dos tooltips (M1–M8)
src/components/              onboarding, lista de casos, wizard e etapas
tests/engine.test.ts         testes do motor
```

## Deploy gratuito na Vercel

O projeto não usa servidor nem segredos, então funciona no plano gratuito (Hobby) da Vercel sem nenhuma configuração extra. Basta publicar esta pasta num repositório Git (GitHub, GitLab ou Bitbucket). Na Vercel, escolha **Add New… → Project**, importe o repositório e, se a pasta `pbl8/webapp` não estiver na raiz do repositório, informe-a em **Root Directory**. A Vercel detecta Next.js sozinha (comando de build `npm run build`, sem variáveis de ambiente). Depois disso, cada push na branch principal gera um novo deploy, e cada pull request ganha uma URL de pré-visualização. O deploy real não foi feito neste trabalho, por falta de credenciais; foi verificado apenas que `npm run build` termina sem erros.

## Limitações

- Os dados ficam só no navegador onde foram digitados. Limpar os dados do site apaga os casos, então use "Exportar JSON" para guardar cópias.
- O congelamento da decisão impede alterações pela interface, mas não protege contra quem edita o `localStorage` ou o JSON à mão. Não há autenticação nem assinatura.
- Os pesos, limiares, a distância de fronteira e a variação da sensibilidade são parâmetros declarados do instrumento, não valores calibrados empiricamente. A ferramenta não estima a incerteza estatística das medições.
- Os três casos de exemplo usam dados simulados ou de referência, não medições de produção.
