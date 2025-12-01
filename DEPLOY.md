# Guia de Deploy Automático (CI/CD)

O sistema está configurado com um pipeline de **Integração e Entrega Contínua (CI/CD)**. Isso significa que qualquer alteração aprovada no código é publicada automaticamente.

## Fluxo de Atualização

1.  **Desenvolvimento**: Você (ou a IA) faz alterações no código localmente.
2.  **Commit & Push**: As alterações são enviadas para o GitHub.
    ```bash
    git add .
    git commit -m "Descrição da mudança"
    git push origin main
    ```
3.  **Automação Vercel**:
    *   A Vercel detecta o novo código no GitHub.
    *   Inicia automaticamente o processo de "Build".
    *   Se o build for sucesso, o site é atualizado.

## Links Importantes

*   **Site Online**: [https://outlet-store-manager-o2c5p2xl6-wndricks-projects.vercel.app](https://outlet-store-manager-o2c5p2xl6-wndricks-projects.vercel.app)
*   **Repositório GitHub**: [https://github.com/wendrick1998/outlet-store-manager](https://github.com/wendrick1998/outlet-store-manager)
*   **Dashboard Vercel**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

## Variáveis de Ambiente

As seguintes chaves estão configuradas na Vercel (Settings > Environment Variables):
*   `VITE_SUPABASE_URL`: Conexão com o banco de dados.
*   `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase.

> **Nota**: Se precisar adicionar chaves de API (ex: Gemini), adicione tanto no arquivo `.env` local quanto no painel da Vercel.
