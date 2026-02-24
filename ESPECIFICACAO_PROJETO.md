# Especificação Técnica: Escala de Porteiros 2026

Este documento detalha todas as regras de negócio, requisitos de design e funcionalidades implementadas no projeto "Escala de Porteiros 2026". Utilize este documento como referência para solicitar o desenvolvimento ou manutenção do projeto no futuro.

## 1. Visão Geral do Projeto
Desenvolvimento de uma aplicação web responsiva (Mobile First) para geração, visualização e validação da escala de porteiros da Congregação Cristã no Brasil (Jd. São Luiz, Barueri, SP) para o ano de 2026.

## 2. Regras de Negócio (Algoritmo de Escala)

### 2.1. Estrutura da Escala
- **Período**: Ano completo de 2026.
- **Turnos**:
  - **Domingo**: Manhã e Noite.
  - **Quarta-feira**: Noite.
  - **Sábado**:
    - **1º Sábado do Mês**: Tarde (Ensaio) e Noite.
    - **Demais Sábados**: Apenas Noite.
- **Capacidade**: 3 porteiros por turno.

### 2.2. Regras Específicas por Irmão
- **Thiago**:
  - Escala fixa: Exatamente 2 vezes por mês.
  - Disponibilidade: Apenas Quartas-feiras à Noite.
- **Williams**:
  - Escala fixa: Exatamente 3 vezes por mês.
- **Adilson**:
  - Disponibilidade: Apenas Domingos à Noite.
- **Restrições de Datas (Dias Proibidos)**:
  - Lista específica de dias em que determinados irmãos não podem ser escalados (ex: férias, compromissos).

### 2.3. Regras Gerais de Distribuição
- **Equilíbrio**: Distribuição justa da carga de trabalho entre os demais irmãos.
- **Espaçamento**: Maximizar o intervalo de dias entre duas escalas do mesmo irmão para evitar sobrecarga.
- **Santa Ceia**:
  - Datas específicas (ex: 07/06/2026).
  - Exibição diferenciada na escala (destaque visual).
  - Não consome a cota regular de escalas.

## 3. Interface e Design (UI/UX)

### 3.1. Design System
- **Tokens de Design**: Uso estrito de variáveis CSS para cores, espaçamentos, tipografia e bordas, conforme especificado no documento de identidade visual.
- **Framework**: Tailwind CSS configurado para mapear os tokens do Design System.
- **Ícones**: Uso da biblioteca `lucide-react` (Sol, Lua, Nuvem, etc.).

### 3.2. Layout Responsivo
- **Mobile (Celular)**:
  - Visualização em lista compacta.
  - Cabeçalhos de mês fixos (Sticky Headers) com fundo opaco para não sobrepor conteúdo.
  - Botões de ação acessíveis e otimizados para toque.
- **Desktop (Computador)**:
  - Visualização em tabela detalhada.
  - Colunas: Data, Dia da Semana, Turno, Participantes.
  - Filtros expandidos na lateral ou topo.

### 3.3. Funcionalidades de Interface
- **Auto-Scroll**: Ao abrir a aplicação, a tela deve rolar automaticamente para o dia atual ou o próximo turno futuro.
- **Filtros Avançados**:
  - Por Irmão (Multi-seleção).
  - Por Mês.
  - Por Data (Busca textual ou Range).
  - Botão "Limpar Filtros" discreto e funcional.
- **Badges Visuais**:
  - Identificação clara de turnos (Manhã = Amarelo, Tarde = Laranja, Noite = Índigo).
  - Badge especial "ENSAIO" para o turno da tarde do 1º sábado.
  - Badge de "SANTA CEIA" com destaque de alerta.

## 4. Funcionalidades do Sistema

### 4.1. Geração de Escala
- O sistema gera a escala automaticamente no navegador (Client-side) ao carregar, garantindo rapidez e privacidade.

### 4.2. Validação Automática
- Aba dedicada "Validação" que verifica o cumprimento de todas as regras:
  - Contagem de escalas por irmão.
  - Respeito às restrições de dias e disponibilidade.
  - Espaçamento mínimo entre escalas.
  - Capacidade correta por turno.

### 4.3. Estatísticas
- Visualização gráfica ou em lista da distribuição de turnos por irmão para conferência de equilíbrio.

### 4.4. Exportação
- Funcionalidade de exportar a escala gerada para arquivo CSV (compatível com Excel).
- Botão de exportação acessível tanto no Mobile quanto no Desktop.

## 5. Stack Tecnológica
- **Linguagem**: TypeScript.
- **Framework**: React.
- **Build Tool**: Vite.
- **Estilização**: Tailwind CSS + CSS Variables.
- **Manipulação de Datas**: date-fns.
- **Ícones**: lucide-react.

---
*Documento gerado automaticamente por YouWare em 23/02/2026.*
