# Finanças do Casal (PWA)

Projeto simples para controle de despesas do casal. Stack: Next.js (App Router), TypeScript, Supabase (Auth, Postgres, Storage), Tailwind, deploy na Vercel.

Como usar (local):

1. Instale dependências

```bash
npm install
```

2. Crie um projeto no Supabase (free). Configure uma tabela `users` via Auth.

3. Defina variáveis de ambiente (ex.: no .env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role (opcional, NÃO usar no cliente)
```

4. Rode em desenvolvimento

```bash
npm run dev
```

Infra e custos
- Projeto projetado para plano free do Supabase e Vercel
- Evitar integrações pagas; OCR é placeholder — sugiro Tesseract.js local se quiser OCR gratuito (custos de CPU)

Notas de implementação
- As APIs `/api/ocr` e `/api/importar-fatura` estão implementadas como placeholders/estubs.
- `lib/pdfParser.ts` usa `pdf-parse` para extrair linhas; ajuste para PDFs reais.
- SQL schema em `sql/schema.sql` contém as tabelas e políticas RLS sugeridas.

Deploy
- Deploy na Vercel: conectar repo e configurar as variáveis de ambiente no dashboard da Vercel.
