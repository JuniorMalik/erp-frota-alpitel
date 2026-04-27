# ERP Completo de Gestão de Frota e Manutenção - Alpitel

Plataforma técnica desenvolvida para o monitoramento e controle de ativos automotivos, integrando toda a cadeia de operação: desde o controle de uso na rua até o fluxo de consertos na oficina, com rigoroso controle de acesso hierárquico.

## 🚀 Recursos Implementados
- **Arquitetura Multi-Roles (Hierarquia de Acesso):** Controle de permissões dinâmico em 5 níveis (`Admin`, `Gestão`, `Supervisão`, `Frota` e `Mecânico`), garantindo que cada usuário só veja os módulos e ações pertinentes ao seu cargo.
- **Hub Operacional Dinâmico:** Portal central (`dashboard.html`) que roteia os acessos com base na função do usuário.
- **Módulo de Operação e Frota:** Dashboard em tempo real para controle de avarias, histórico de veículos e monitoramento visual (Tracker de status).
- **Portal do Mecânico:** Fluxo exclusivo para a equipe de manutenção (Recebimento de Avarias -> Iniciar Serviço -> Concluir Reparo).
- **Audit Trail (Rastreio de Ações):** Sistema de log automatizado que carimba o nome do usuário e a hora exata em todas as ações do sistema (reporte de avarias, aceite de oficina e liberação).
- **Gestão de Acessos:** Painel para líderes criarem novos logins, limitado pelas regras de negócio (Ex: Supervisores só podem criar Colaboradores).
- **Persistência de Dados:** Sincronização e armazenamento de estado via Web Storage API e sessionStorage para proteção de rotas.

## 🛠 Especificações Técnicas
- **Frontend:** HTML5 Semântico e CSS3 (UI Moderno com Custom Properties, Glassmorphism e CSS Grid/Flexbox).
- **Lógica de Negócio:** Vanilla JavaScript (ES6+), dispensando frameworks pesados para garantir máxima performance.
- **Identidade Visual:** Padronização premium seguindo o manual de marca da Alpitel (Verde `#008C45` e Vermelho `#CD212A`).

## 💼 Contexto de Aplicação
Este sistema foi projetado para solucionar o gargalo de comunicação entre a rua (Colaboradores), o escritório (Gestão) e a garagem (Mecânicos). Ele força a adoção de um processo onde problemas veiculares não podem ser burlados, garantindo segurança na frota e histórico perfeito de manutenções.

Logins e senhas para testes de hienarquia.

| Login | Senha |
| --- | --- |
| **admin** | 12345 |
| **gestao** | 12345 |
| **supervisor** | 12345 |
| **manutencao** | 12345 |
| **colaborador** | 12345 |

---
**Desenvolvedor:** Wilson Borges Xavier Júnior
