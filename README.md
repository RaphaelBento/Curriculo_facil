# Currículo Fácil

Gerador de currículo em PDF feito com **Vue 3 + Vite**. O usuário preenche um
formulário simples, acompanha a prévia em tempo real (folha A4) e baixa o PDF —
tudo no navegador, sem cadastro e sem backend.

> Este é um esboço inicial (v0.1). A base já está pronta para evoluir.

🔗 **Site no ar:** https://raphaelbento.github.io/Curriculo_facil/

[![Site no ar](https://img.shields.io/badge/site-no%20ar-2563eb?style=flat-square)](https://raphaelbento.github.io/Curriculo_facil/)

<p align="center">
  <a href="https://raphaelbento.github.io/Curriculo_facil/">
    <img src="docs/preview.png" alt="Interface do Currículo Fácil: formulário à esquerda e prévia do currículo em A4 à direita" width="860">
  </a>
</p>

## Funcionalidades

- Formulário com dados pessoais, escolaridade, último e penúltimo emprego,
  objetivo e habilidades.
- Prévia fiel ao PDF, atualizada em tempo real, com opção de tela cheia.
- **PDF com texto selecionável** (gerado com jsPDF), ideal para sistemas de
  recrutamento/ATS — não é uma imagem do currículo.
- Layout 100% responsivo (desktop, tablet e celular).
- Cinco cores de destaque.
- Salvamento automático do rascunho no `localStorage` (nada é enviado para
  nenhum servidor).
- Validação dos campos obrigatórios com mensagens em português.

## Como rodar no VS Code

Precisa de **Node.js 20.19+ ou 22.12+** (o projeto foi testado com o Node 22).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

### Se o `npm` não rodar no PowerShell

Em alguns Windows a execução de scripts do PowerShell fica bloqueada
(`npm.ps1 não pode ser carregado`). Use uma destas opções:

```powershell
# opção 1: chamar o npm.cmd
npm.cmd run dev

# opção 2: liberar scripts para o seu usuário
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Estrutura do projeto

```
Curriculo_facil/
├─ .github/workflows/deploy.yml   # deploy automático no GitHub Pages
├─ docs/preview.png               # captura de tela usada neste README
├─ public/favicon.svg
├─ src/
│  ├─ App.vue                     # layout da página + ações (gerar/limpar)
│  ├─ assets/main.css             # estilos globais e componentes base
│  ├─ components/
│  │  ├─ ResumeForm.vue           # formulário em etapas
│  │  ├─ ResumePreview.vue        # moldura A4 com escala automática + modal
│  │  └─ ResumeSheet.vue          # o currículo em si (prévia)
│  ├─ lib/
│  │  ├─ format.js                # formatação (nome, telefone, período, etc.)
│  │  └─ resumePdf.js             # geração do PDF com jsPDF
│  ├─ stores/resume.js            # estado reativo, validação e rascunho local
│  └─ main.js
├─ index.html
├─ jsconfig.json                  # alias "@/..." para o VS Code
└─ vite.config.js
```

## Como o PDF é gerado

O arquivo `src/lib/resumePdf.js` desenha o currículo diretamente no PDF usando a
API do **jsPDF** (mm, A4, margens de 16 mm). Isso garante:

- texto real e selecionável (recrutadores e ATS conseguem ler);
- arquivo leve;
- quebra de página automática quando o conteúdo cresce;
- rodapé com numeração de páginas.

A prévia em HTML (`ResumeSheet.vue`) segue a mesma hierarquia visual do PDF, mas
não é uma cópia pixel a pixel — pequenas diferenças de quebra de linha são
esperadas.









