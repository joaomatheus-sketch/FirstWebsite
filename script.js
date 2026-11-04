document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('#page-content');
    const sidebar = document.querySelector('#sidebar');
    const dialog = document.querySelector('.app-dialog');
    const dialogForm = document.querySelector('.dialog-form');
    const dialogFields = document.querySelector('.dialog-fields');
    const dialogTitle = document.querySelector('#dialog-title');
    const toastRegion = document.querySelector('.toast-region');
    const navLinks = [...document.querySelectorAll('.nav-link')];
    const menuButton = document.querySelector('.mobile-menu-button');
    const menuBackdrop = document.querySelector('.sidebar-backdrop');
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const records = {
        estoque: [],
        doacoes: [],
        voluntarios: [],
        financeiro: [],
        metas: []
    };
    const demoSummary = {
        financialDonations: 18400,
        financialDonationCount: 64,
        foodDonationCount: 12,
        foodDonationKg: 300,
        uniqueDonors: 48
    };
    const organization = {
        name: 'Instituto Mãos Unidas',
        city: 'Liberato, MG',
        email: 'contato@maosunidas.org'
    };
    const storageKey = 'gestao-do-bem-demo-v2';
    const demoDate = '2026-09-30';

    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const pageHeading = (title, description, actions = '') => `
        <div class="page-heading">
            <div><h1>${title}</h1><p>${description}</p></div>
            <div class="heading-actions">${actions}</div>
        </div>`;

    const periodChip = '<span class="period-chip" aria-label="Período demonstrativo: setembro de 2026"><span aria-hidden="true">▦</span> Setembro de 2026</span>';

    const button = (label, action, style = 'primary', icon = '+') => `
        <button class="button button-${style}" type="button" data-action="${action}">
            <span aria-hidden="true">${icon}</span>${label}
        </button>`;

    const panel = (title, body, options = {}) => `
        <section class="panel">
            <div class="panel-heading">
                <div><h2>${title}</h2>${options.subtitle ? `<p>${options.subtitle}</p>` : ''}</div>
                ${options.action || ''}
            </div>
            ${body}
        </section>`;

    const stat = (label, value, note, icon = '◌', link = '') => `
        <article class="stat-card">
            <span class="stat-label">${label}</span><span class="stat-icon" aria-hidden="true">${icon}</span>
            <strong class="stat-value">${value}</strong>
            <span class="stat-note">${note}</span>
            ${link ? `<a class="stat-link" href="#${link.page}" data-page="${link.page}">${link.label}</a>` : ''}
        </article>`;

    const statsGrid = (...items) => `<div class="stats-grid">${items.join('')}</div>`;

    const status = (label, tone = '') => `<span class="status ${tone}">${label}</span>`;

    const table = (headers, rows, options = {}) => {
        const tableRows = rows.map((row) => `<tr${row.warning ? ' class="row-warning"' : ''}>${
            row.cells.map((cell) => `<td>${cell}</td>`).join('')
        }</tr>`).join('') + `<tr data-empty-state hidden><td colspan="${headers.length}">Nenhum registro corresponde à busca ou aos filtros.</td></tr>`;
        const searchable = options.search !== false;
        const filters = options.filters || [];
        const filterMarkup = filters.map((filter) => `
            <select class="filter-control" aria-label="${filter.label}" data-filter="${filter.key}">
                ${filter.options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}
            </select>`).join('');

        return `
            ${searchable || filters.length ? `<div class="table-tools">
                ${searchable ? `<input class="search-input" type="search" placeholder="${options.placeholder || 'Buscar...'}" aria-label="${options.placeholder || 'Buscar na tabela'}" data-table-search>` : ''}
                ${filterMarkup}
            </div>` : ''}
            <p class="table-hint">Deslize a tabela para ver todas as colunas.</p>
            <div class="table-wrap" tabindex="0" aria-label="Tabela com rolagem horizontal"><table class="data-table">
                <thead><tr>                ${headers.map((header) => `<th scope="col">${header}</th>`).join('')}</tr></thead>
                <tbody>${tableRows || `<tr><td colspan="${headers.length}">Nenhum registro encontrado.</td></tr>`}</tbody>
            </table></div>
            ${options.footer ? `<div class="table-footer"><span>${options.footer}</span>${options.pagination ? '<div class="pagination"><span>Registros desta página</span></div>' : ''}</div>` : ''}`;
    };

    const chart = (firstLabel = 'Entradas', secondLabel = '', bars = [42, 58, 82, 65], secondBars = [30, 43, 64, 48]) => `
        <div class="chart">
            <div class="chart-legend">
                <span class="legend-item"><i class="legend-dot"></i>${firstLabel}</span>
                ${secondLabel ? `<span class="legend-item"><i class="legend-dot secondary"></i>${secondLabel}</span>` : ''}
            </div>
            <div class="bar-chart" role="img" aria-label="Gráfico demonstrativo de ${firstLabel.toLowerCase()}${secondLabel ? ` e ${secondLabel.toLowerCase()}` : ''}">
                ${bars.map((height, index) => `<div class="bar-group">
                    <div class="bar-pair">
                        <span class="bar" style="height:${height}%"></span>
                        ${secondLabel ? `<span class="bar secondary" style="height:${secondBars[index]}%"></span>` : ''}
                    </div>
                    <span class="bar-label">${['01–07 set', '08–14 set', '15–21 set', '22–30 set'][index]}</span>
                </div>`).join('')}
            </div>
            <span class="chart-footnote">Valores demonstrativos · Setembro de 2026</span>
        </div>`;

    const stockRows = [
        { name: 'Arroz', quantity: 180, unit: 'kg', daily: 9, days: 20, updated: '30/09/26 · 17:30' },
        { name: 'Feijão', quantity: 120, unit: 'kg', daily: 6, days: 20, updated: '30/09/26 · 17:30' },
        { name: 'Macarrão', quantity: 72, unit: 'kg', daily: 6, days: 12, updated: '30/09/26 · 17:30' },
        { name: 'Farinha', quantity: 36, unit: 'kg', daily: 6, days: 6, updated: '30/09/26 · 17:30' },
        { name: 'Leite em pó', quantity: 12, unit: 'kg', daily: 4, days: 3, updated: '30/09/26 · 17:30' }
    ];
    const stockTotal = () => stockRows.reduce((total, item) => total + item.quantity, 0);
    const stockAlerts = () => stockRows.filter((item) => item.days <= 7);

    const donationRows = [
        { donor: 'Ana Oliveira', date: '30/09/2026', category: 'Financeira · Pix', quantity: 'R$ 800,00', type: 'financeira' },
        { donor: 'Mercado Bom Preço', date: '28/09/2026', category: 'Alimentos · arroz', quantity: '60 kg', type: 'alimentos' },
        { donor: 'Padaria Esperança', date: '27/09/2026', category: 'Alimentos · farinha', quantity: '24 kg', type: 'alimentos' },
        { donor: 'Padaria Esperança', date: '27/09/2026', category: 'Financeira · transferência', quantity: 'R$ 1.200,00', type: 'financeira' },
        { donor: 'Carlos Santos', date: '25/09/2026', category: 'Financeira · Pix', quantity: 'R$ 350,00', type: 'financeira' },
        { donor: 'Associação do Bairro', date: '24/09/2026', category: 'Alimentos · feijão', quantity: '40 kg', type: 'alimentos' }
    ];

    const volunteerRows = [
        { name: 'Ana Oliveira', role: 'Distribuição de cestas', availability: 'Sábados · manhã', contact: 'ana.oliveira@example.com', status: 'Ativo' },
        { name: 'Lucas Ferreira', role: 'Organização do estoque', availability: 'Terças e quintas · tarde', contact: 'lucas.f@example.com', status: 'Ativo' },
        { name: 'Beatriz Lima', role: 'Preparo de refeições', availability: 'Seg. a sex. · manhã', contact: 'beatriz.l@example.com', status: 'Ativo' },
        { name: 'Pedro Almeida', role: 'Transporte e logística', availability: 'Sábados · manhã', contact: 'pedro.a@example.com', status: 'Ativo' },
        { name: 'Juliana Rocha', role: 'Apoio administrativo', availability: 'Quartas · tarde', contact: 'juliana.r@example.com', status: 'Ativo' },
        { name: 'Rafael Souza', role: 'Distribuição de cestas', availability: 'Domingos · manhã', contact: 'rafael.s@example.com', status: 'Sem participação' }
    ];

    const financeRows = [
        { date: '30/09/2026', description: 'Compra de alimentos · Mercado Bom Preço', category: 'Alimentos', type: 'Saída', value: '− R$ 1.250,00' },
        { date: '29/09/2026', description: 'Doação via Pix · Ana Oliveira', category: 'Doação financeira', type: 'Entrada', value: '+ R$ 800,00' },
        { date: '28/09/2026', description: 'Transporte de cestas · Logística solidária', category: 'Transporte', type: 'Saída', value: '− R$ 450,00' },
        { date: '27/09/2026', description: 'Doação empresarial · Padaria Esperança', category: 'Doação financeira', type: 'Entrada', value: '+ R$ 1.200,00' },
        { date: '26/09/2026', description: 'Materiais para organização do estoque', category: 'Materiais de apoio', type: 'Saída', value: '− R$ 300,00' },
        { date: '25/09/2026', description: 'Doação via Pix · Carlos Santos', category: 'Doação financeira', type: 'Entrada', value: '+ R$ 350,00' }
    ];
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatGoalAmount = (goal, value) => {
        if (goal.unit === 'BRL') return formatCurrency(value);
        const amount = Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
        if (goal.unit === 'kg') return `${amount} kg`;
        return `${amount} ${Number(value) === 1 ? 'voluntário' : 'voluntários'}`;
    };
    const financeTotals = () => records.financeiro.reduce((totals, item) => {
        totals[item.type === 'Entrada' ? 'entries' : 'exits'] += item.amount || 0;
        return totals;
    }, { entries: 18400, exits: 12750 });

    const expenseCategoryTotals = () => {
        const categories = {
            Alimentos: 8250,
            Transporte: 1800,
            Estrutura: 1500,
            'Materiais de apoio': 1200
        };
        records.financeiro
            .filter((item) => item.type === 'Saída')
            .forEach((item) => {
                categories[item.category] = (categories[item.category] || 0) + item.amount;
            });
        return categories;
    };

    const metaRows = [
        { donor: 'Ana Oliveira', date: '29/09/2026', method: 'Pix', value: 'R$ 800,00' },
        { donor: 'Padaria Esperança', date: '27/09/2026', method: 'Transferência', value: 'R$ 1.200,00' },
        { donor: 'Carlos Santos', date: '25/09/2026', method: 'Pix', value: 'R$ 350,00' }
    ];
    const campaignGoals = [
        { id: 'arrecadacao', title: 'Meta de arrecadação', subtitle: 'Cestas que transformam', unit: 'BRL', currentAmount: 18400, targetAmount: 25000 },
        { id: 'alimentos', title: 'Alimentos na mesa', subtitle: 'Alimentos recebidos', unit: 'kg', currentAmount: 300, targetAmount: 500 },
        { id: 'voluntarios', title: 'Juntos pela comunidade', subtitle: 'Voluntários ativos', unit: 'voluntarios', currentAmount: 28, targetAmount: 32 }
    ];

    const stockTableRows = () => stockRows.map((item) => {
        const warning = item.days <= 7;
        return {
            warning,
            cells: [
                escapeHtml(item.name),
                `${item.quantity} ${item.unit}`,
                `${item.daily} ${item.unit}/dia`,
                `${item.daily * 7} ${item.unit}/semana`,
                `${item.days} dias`,
                status(warning ? 'Repor em breve' : 'Estável', warning ? 'warning' : ''),
                escapeHtml(item.updated)
            ]
        };
    });

    const donationTableRows = () => [...records.doacoes, ...donationRows].map((item) => ({
        cells: [
            escapeHtml(item.donor),
            escapeHtml(item.date),
            escapeHtml(item.category),
            escapeHtml(item.quantity),
            status('Recebida')
        ]
    }));

    const volunteerTableRows = () => [...records.voluntarios, ...volunteerRows].map((item) => ({
        cells: [
            escapeHtml(item.name),
            escapeHtml(item.role),
            escapeHtml(item.availability),
            escapeHtml(item.contact),
            status(item.status, item.status === 'Ativo' ? '' : 'neutral')
        ]
    }));

    const financeTableRows = () => [...records.financeiro, ...financeRows].map((item) => ({
        cells: [
            escapeHtml(item.date),
            escapeHtml(item.description),
            escapeHtml(item.category),
            status(item.type, item.type === 'Entrada' ? 'blue' : 'neutral'),
            `<strong class="${item.type === 'Entrada' ? 'positive' : 'negative'}">${escapeHtml(item.value)}</strong>`
        ]
    }));

    const renderOverview = () => {
        const actions = `${periodChip}${button('Registrar doação', 'doacao', 'primary')}`;
        const raised = demoSummary.financialDonations;
        const goal = campaignGoals[0];
        const goalTarget = goal.targetAmount || 25000;
        const progress = Math.min(100, raised / goalTarget * 100);
        const stockOverview = stockRows.map((item) => ({
            warning: item.days <= 7,
            cells: [
                escapeHtml(item.name),
                `${item.quantity} ${item.unit}`,
                `${item.daily} ${item.unit}/dia`,
                `${item.days} dias`,
                status(item.days <= 7 ? 'Repor em breve' : 'Estável', item.days <= 7 ? 'warning' : '')
            ]
        }));
        const movementItems = [
            ...records.financeiro.slice(0, 4).map((item) => [
                item.type === 'Entrada' ? '↙' : '▧',
                item.description.split(' · ')[0],
                `${item.date} · ${item.description.split(' · ').slice(1).join(' · ')}`,
                item.value,
                item.type === 'Entrada' ? 'positive' : 'negative'
            ]),
            ['▧', 'Compra de alimentos', '30 set · Mercado Bom Preço', '− R$ 1.250,00', 'negative'],
            ['↙', 'Doação via Pix', '29 set · Ana Oliveira', '+ R$ 800,00', 'positive'],
            ['▧', 'Transporte de cestas', '28 set · Logística solidária', '− R$ 450,00', 'negative'],
            ['↙', 'Doação empresarial', '27 set · Padaria Esperança', '+ R$ 1.200,00', 'positive']
        ];
        content.innerHTML = `
            ${pageHeading('Visão geral', 'Olá, Mariana! Acompanhe os recursos e o impacto da sua ONG.', actions)}
            ${statsGrid(
                stat('Doações financeiras no mês', formatCurrency(raised), `${demoSummary.financialDonationCount} doações recebidas em setembro`, '♡', { page: 'doacoes', label: 'Arrecadação do mês' }),
                stat('Voluntários ativos no mês', '28', 'De 36 voluntários cadastrados', '♧', { page: 'voluntarios', label: 'Participaram de pelo menos 1 ação' }),
                stat('Alimentos disponíveis', `${stockTotal()} kg`, `${stockRows.length} alimentos cadastrados · consumo de 31 kg/dia`, '◇', { page: 'estoque', label: `${stockAlerts().length} itens precisam de reposição` })
            )}
            <div class="content-grid">
                ${panel('Estoque de alimentos', table(
                    ['Alimento', 'Disponível', 'Consumo diário', 'Duração', 'Situação'],
                    stockOverview,
                    { search: false }
                ), { action: '<a class="panel-action" href="#estoque" data-page="estoque">Atualizar estoque →</a>' })}
                ${panel(escapeHtml(goal.title), `
                    <p class="panel-subtitle">${escapeHtml(goal.subtitle)} · Setembro</p>
                    <span class="panel-subtitle">Registrada por Mariana Costa</span>
                    <div class="goal-amount">${formatCurrency(raised)}</div>
                    <div class="goal-meta"><span>Arrecadados de ${formatCurrency(goalTarget)}</span></div>
                    <div class="progress-row"><span>Progresso da meta</span><strong>${progress.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong></div>
                    <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
                    <div class="info-banner">◉ &nbsp;Faltam ${formatCurrency(Math.max(0, goalTarget - raised))} para atingir a meta.</div>
                `, { action: '<a class="panel-action" href="#metas" data-page="metas">Editar meta</a>' })}
            </div>
            <div class="content-grid">
                ${panel('Financeiro do mês', chart('Arrecadação', 'Despesas', [40, 58, 79, 61], [28, 43, 61, 49]), { subtitle: 'Entradas e despesas · 01 a 30 de setembro' })}
                ${panel('Movimentações', `<div class="activity-list">${movementItems.map(([icon, title, detail, amount, tone]) => `
                    <div class="activity-item"><span class="activity-icon">${icon}</span>
                    <div class="activity-copy"><strong>${title}</strong><span>${detail}</span></div>
                    <span class="activity-amount ${tone}">${amount}</span></div>`).join('')}</div>`, { action: '<a class="panel-action" href="#financeiro" data-page="financeiro">Ver todas →</a>' })}
            </div>`;
    };

    const renderStock = () => {
        const actions = `${periodChip}${button('Registrar entrada', 'estoque-entrada', 'primary')}${button('Registrar saída', 'estoque-saida', 'outline', '−')}`;
        const alerts = stockAlerts();
        const replenishments = alerts.map((item) => ({
            cells: [escapeHtml(item.name), `${item.quantity} ${item.unit}`, `<strong>${Math.max(0, item.daily * 14 - item.quantity)} ${item.unit}</strong>`]
        }));
        const movementItems = records.estoque.slice(0, 3).map((item) => `
            <div class="activity-item"><span class="activity-icon">${item.type === 'Entrada' ? '↗' : '↙'}</span>
            <div class="activity-copy"><strong>${escapeHtml(item.type)} · ${escapeHtml(item.source)}</strong><span>${escapeHtml(item.date)} · ${escapeHtml(item.quantity)} de ${escapeHtml(item.name)}</span></div></div>`);
        content.innerHTML = `
            ${pageHeading('Estoque', 'Controle os alimentos disponíveis e planeje as reposições.', actions)}
            ${statsGrid(
                stat('Alimentos disponíveis', `${stockTotal()} kg`, `${stockRows.length} alimentos cadastrados`, '◇', { page: 'estoque', label: 'Posição atual do estoque' }),
                stat('Consumo médio', '31 kg/dia', '217 kg por semana', '▥', { page: 'estoque', label: 'Média utilizada para estimar a duração' }),
                stat('Itens em alerta', `${alerts.length} alimentos`, alerts.map((item) => item.name).join(' e ') || 'Nenhum item precisa de reposição', '⚠', { page: 'estoque', label: 'Reposição necessária em até 7 dias' })
            )}
            ${alerts.length ? `<div class="alert-banner"><span aria-hidden="true">⚠</span><span>Priorize ${alerts.map((item) => `${escapeHtml(item.name)} (${item.days} dias)`).join(' e ')}. A duração é calculada pelo consumo médio cadastrado.</span></div>` : '<div class="alert-banner success"><span aria-hidden="true">✓</span><span>Todos os itens têm mais de 7 dias de cobertura.</span></div>'}
            ${panel('Estoque de alimentos', table(
                ['Alimento', 'Disponível', 'Consumo diário', 'Consumo semanal', 'Duração', 'Situação', 'Atualização'],
                stockTableRows(),
                {
                    placeholder: 'Buscar alimento...',
                    filters: [
                        { key: 'category', label: 'Categoria', options: [{ value: 'all', label: 'Todos os alimentos' }, { value: 'alimento', label: 'Alimentos' }] },
                        { key: 'status', label: 'Situação', options: [{ value: 'all', label: 'Todas as situações' }, { value: 'warning', label: 'Repor em breve' }, { value: 'ok', label: 'Estável' }] }
                    ],
                    footer: `Total disponível: ${stockTotal()} kg · Consumo médio: 31 kg/dia`
                }
            ))}
            <div class="content-grid equal" style="margin-top:11px">
                ${panel('Reposições prioritárias', table(['Alimento', 'Estoque atual', 'Repor'], replenishments, {
                    search: false,
                    footer: 'Reposição sugerida para 14 dias de consumo médio.'
                }))}
                ${panel('Últimos registros', `<div class="activity-list">${movementItems.join('') || `
                    <div class="activity-item"><span class="activity-icon">↙</span><div class="activity-copy"><strong>Saída · preparo de refeições</strong><span>30/09 · 21 kg</span></div></div>
                    <div class="activity-item"><span class="activity-icon">↗</span><div class="activity-copy"><strong>Entrada · Mercado Bom Preço</strong><span>28/09 · 40 kg</span></div></div>
                    <div class="activity-item"><span class="activity-icon">↗</span><div class="activity-copy"><strong>Entrada · Padaria Esperança</strong><span>25/09 · 24 kg</span></div></div>
                `}</div>`)}
            </div>`;
    };

    const renderDonations = () => {
        const actions = `${periodChip}${button('Registrar doação', 'doacao', 'primary')}`;
        const foodWeight = demoSummary.foodDonationKg;
        content.innerHTML = `
            ${pageHeading('Doações', 'Acompanhe os recebimentos e quem contribui com a sua ONG.', actions)}
            ${statsGrid(
                stat('Doações financeiras no mês', formatCurrency(demoSummary.financialDonations), `${demoSummary.financialDonationCount} doações recebidas em setembro`, '♡', { page: 'financeiro', label: 'Arrecadação do mês' }),
                stat('Doações recebidas', String(demoSummary.financialDonationCount + demoSummary.foodDonationCount), `${demoSummary.financialDonationCount} financeiras + ${demoSummary.foodDonationCount} de alimentos`, '◇', { page: 'estoque', label: `${foodWeight} kg de alimentos recebidos no mês` }),
                stat('Doadores no mês', String(demoSummary.uniqueDonors), 'Pessoas e organizações únicas', '♧', { page: 'doacoes', label: 'Contagem demonstrativa, sem duplicidade' })
            )}
            <div class="content-grid">
                ${panel('Evolução da arrecadação', chart('Entradas', '', [35, 53, 79, 58]), { subtitle: 'Doações financeiras recebidas por semana' })}
                ${panel('Cestas que transformam', `
                    <p class="panel-subtitle">Meta de arrecadação · Setembro</p>
                    <div class="goal-amount">${formatCurrency(demoSummary.financialDonations)}</div>
                    <div class="goal-meta"><span>Arrecadados de ${formatCurrency(campaignGoals[0].targetAmount)}</span></div>
                    <div class="progress-row"><span>Progresso da meta</span><strong>${Math.min(100, demoSummary.financialDonations / campaignGoals[0].targetAmount * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong></div>
                    <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, demoSummary.financialDonations / campaignGoals[0].targetAmount * 100)}%"></div></div>
                    <div class="info-banner">◉ &nbsp;Faltam ${formatCurrency(Math.max(0, campaignGoals[0].targetAmount - demoSummary.financialDonations))} para atingir a meta.</div>
                    <p class="panel-subtitle" style="margin-top:10px">Alimentos são contabilizados em kg e não entram no total financeiro.</p>
                `, { action: '<a class="panel-action" href="#metas" data-page="metas">Ver meta →</a>' })}
            </div>
            ${panel('Doações do período', table(
                ['Doador', 'Data', 'Categoria', 'Quantidade / valor', 'Status'],
                donationTableRows(),
                {
                    placeholder: 'Buscar doador...',
                    filters: [
                        { key: 'category', label: 'Categoria', options: [{ value: 'all', label: 'Todas as categorias' }, { value: 'financeira', label: 'Financeira' }, { value: 'alimentos', label: 'Alimentos' }] },
                        { key: 'status', label: 'Status', options: [{ value: 'all', label: 'Todos os status' }, { value: 'received', label: 'Recebida' }] }
                    ],
                    footer: 'Exibindo os registros demonstrativos do período.'
                }
            ))}`;
    };

    const renderVolunteers = () => {
        const actions = `${periodChip}${button('Cadastrar voluntário', 'voluntario', 'primary')}`;
        const activeVolunteers = 28 + records.voluntarios.length;
        const totalVolunteers = 36 + records.voluntarios.length;
        content.innerHTML = `
            ${pageHeading('Voluntários', 'Organize a equipe, a disponibilidade e as próximas atividades.', actions)}
            ${statsGrid(
                stat('Voluntários ativos no mês', String(activeVolunteers), `De ${totalVolunteers} voluntários cadastrados`, '♧', { page: 'voluntarios', label: 'Participaram de pelo menos 1 ação' }),
                stat('Participação no mês', `${(activeVolunteers / totalVolunteers * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`, `${activeVolunteers} ativos de ${totalVolunteers} com participação`, '◷', { page: 'voluntarios', label: 'Ativos ÷ cadastrados × 100' }),
                stat('Horas de participação', '168 h', '6 h por voluntário ativo', '◷', { page: 'voluntarios', label: 'Registros de presença demonstrativos' })
            )}
            ${panel('Equipe de voluntários', table(
                ['Voluntário', 'Função', 'Disponibilidade', 'Contato', 'Status no mês'],
                volunteerTableRows(),
                {
                    placeholder: 'Buscar nome ou contato...',
                    filters: [
                        { key: 'role', label: 'Função', options: [{ value: 'all', label: 'Todas as funções' }, { value: 'distribution', label: 'Distribuição de cestas' }, { value: 'stock', label: 'Organização do estoque' }] },
                        { key: 'status', label: 'Status', options: [{ value: 'all', label: 'Todos os status' }, { value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Sem participação' }] }
                    ],
                    footer: 'Equipe demonstrativa · Contatos fictícios'
                }
            ))}
            <div class="content-grid equal" style="margin-top:11px">
                ${panel('Participação por atividade', table(['Atividade', 'Ações', 'Presenças', 'Horas'], [
                    { cells: ['Distribuição de cesta', '2', '24', '72 h'] },
                    { cells: ['Preparo de refeições', '2', '20', '60 h'] },
                    { cells: ['Organização do estoque', '2', '12', '36 h'] }
                ], { search: false, footer: '56 presenças somadas em 6 ações.' }))}
                ${panel('Próximas atividades', `<div class="next-activity"><div class="date-tile"><strong>03</strong><span>out</span></div><div><strong>Distribuição de cestas</strong><small>08:00–11:00 · Unidade principal</small></div></div>
                    <div class="next-activity"><div class="date-tile"><strong>06</strong><span>out</span></div><div><strong>Organização do estoque</strong><small>14:00–17:00 · Unidade principal</small></div></div>
                    <div class="info-banner">◉ &nbsp;A disponibilidade é demonstrativa. Cadastre a presença após cada atividade.</div>`)}
            </div>`;
    };

    const renderGoals = () => {
        const actions = `${periodChip}${button('Criar meta', 'meta', 'primary')}`;
        content.innerHTML = `
            ${pageHeading('Metas', 'Acompanhe as campanhas e os objetivos definidos pela coordenação.', actions)}
            <div class="content-grid equal">${campaignGoals.map((goal) => {
                const collected = goal.id === 'arrecadacao' ? demoSummary.financialDonations : goal.currentAmount;
                const targetAmount = goal.targetAmount || 0;
                const progress = targetAmount > 0 ? Math.min(100, collected / targetAmount * 100) : 0;
                const percentage = targetAmount > 0
                    ? `${(collected / targetAmount * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
                    : '0%';
                const current = formatGoalAmount(goal, collected);
                const target = formatGoalAmount(goal, targetAmount);
                return panel(escapeHtml(goal.title), `
                <p class="panel-subtitle">${escapeHtml(goal.subtitle)} · prazo: ${escapeHtml(goal.date || '15/10/2026')}</p>
                <div class="goal-current-row"><strong>${escapeHtml(current)}</strong><button class="button button-outline" type="button" data-action="editar-meta" data-goal-id="${escapeHtml(goal.id)}">✎ Editar meta</button></div>
                <div class="goal-meta"><span>Meta: ${escapeHtml(target)}</span><strong>${escapeHtml(percentage)}</strong></div>
                <div class="progress-track" style="margin-top:6px"><div class="progress-fill" style="width:${progress}%"></div></div>
                <p class="panel-subtitle" style="margin-top:9px">Acompanhe o progresso desta campanha no período.</p>
            `, { subtitle: 'Registrada pela coordenação' });
            }).join('')}</div>
            <div class="content-grid" style="margin-top:11px">
                ${panel('Contribuições para a arrecadação', table(
                    ['Doador', 'Data', 'Forma de recebimento', 'Valor', 'Status'],
                    [...records.metas, ...metaRows].map((item) => ({
                        cells: [escapeHtml(item.donor), escapeHtml(item.date), escapeHtml(item.method), escapeHtml(item.value), status('Recebida')]
                    })),
                    { search: false, footer: 'Contribuições demonstrativas · valores de exemplo' }
                ))}
                ${panel('Como a meta é definida', `<p class="panel-subtitle">Objetivo registrado pela coordenação</p>
                    <span class="status blue">Alvo mensal</span>
                    <p style="font-size:9px;line-height:1.6;color:#59677d">A coordenação define um valor para a campanha. O progresso considera somente doações financeiras recebidas no mês.</p>
                    <div class="info-banner">Progresso = valor arrecadado ÷ alvo da campanha × 100</div>`)}
            </div>`;
    };

    const renderFinance = () => {
        const actions = `${periodChip}${button('Registrar movimentação', 'movimentacao', 'primary')}`;
        const totals = financeTotals();
        const entries = formatCurrency(totals.entries);
        const exits = formatCurrency(totals.exits);
        const balance = formatCurrency(totals.entries - totals.exits);
        const categories = expenseCategoryTotals();
        content.innerHTML = `
            ${pageHeading('Financeiro', 'Acompanhe as entradas, as despesas e o saldo da sua ONG.', actions)}
            ${statsGrid(
                stat('Entradas do período', entries, 'Doações financeiras e registros do mês', '↙', { page: 'doacoes', label: '01 a 30 de setembro' }),
                stat('Saídas do período', exits, 'Despesas e registros do mês', '↗', { page: 'financeiro', label: 'Dados demonstrativos do mês' }),
                stat('Saldo do período', balance, 'Entradas menos saídas do mês', '▣', { page: 'financeiro', label: 'Não representa o saldo bancário acumulado' })
            )}
            <div class="content-grid">
                ${panel('Arrecadação e despesas', chart('Entradas', 'Saídas', [42, 58, 82, 64], [31, 45, 63, 50]), { subtitle: 'Comparativo semanal · 01 a 30 de setembro' })}
                ${panel('Despesas por categoria', table(['Categoria', 'Valor'], [
                    ...Object.entries(categories).map(([category, amount]) => ({ cells: [escapeHtml(category), formatCurrency(amount)] })),
                    { cells: ['Total de saídas', `<strong>${exits}</strong>`] }
                ], { search: false, footer: 'Despesas demonstrativas para o mês.' }), { action: '<a class="panel-action" href="#financeiro" data-action="relatorio">Relatório</a>' })}
            </div>
            ${panel('Movimentações do período', table(
                ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'],
                financeTableRows(),
                {
                    placeholder: 'Buscar descrição ou responsável...',
                    filters: [
                        { key: 'category', label: 'Categoria', options: [{ value: 'all', label: 'Todas as categorias' }, { value: 'Alimentos', label: 'Alimentos' }, { value: 'Transporte', label: 'Transporte' }] },
                        { key: 'type', label: 'Tipo', options: [{ value: 'all', label: 'Entradas e saídas' }, { value: 'Entrada', label: 'Entradas' }, { value: 'Saída', label: 'Saídas' }] }
                    ],
                    footer: 'Entradas e saídas demonstrativas · valores de exemplo'
                }
            ))}
            <div class="info-banner">Saldo do mês = ${entries} − ${exits} = ${balance}. Doações em alimentos são contabilizadas separadamente.</div>`;
    };

    const renderManagement = () => {
        content.innerHTML = `
            ${pageHeading('Gestão da ONG', 'Informações da organização, equipe e preferências do espaço.', button('Editar dados', 'editar-organizacao', 'primary', '✎'))}
            ${statsGrid(
                stat('Organização', escapeHtml(organization.name), `Unidade principal · ${escapeHtml(organization.city)}`, '⌂'),
                stat('Pessoas na equipe', '36', '28 voluntários ativos neste mês', '♧', { page: 'voluntarios', label: 'Ver equipe de voluntários' }),
                stat('Acesso', 'Coordenadora', 'Mariana Costa · perfil atual', '◎')
            )}
            <div class="content-grid equal">
                ${panel('Dados da organização', `<div class="detail-list">
                    <div class="detail-row"><span>Nome</span><strong>${escapeHtml(organization.name)}</strong></div>
                    <div class="detail-row"><span>Unidade</span><strong>Unidade principal</strong></div>
                    <div class="detail-row"><span>Município</span><strong>${escapeHtml(organization.city)}</strong></div>
                    <div class="detail-row"><span>E-mail</span><strong>${escapeHtml(organization.email)}</strong></div>
                </div>`)}
                ${panel('Acesso e permissões', `<div class="detail-list">
                    <div class="detail-row"><span>Mariana Costa</span>${status('Coordenadora', 'blue')}</div>
                    <div class="detail-row"><span>Equipe de voluntários</span><strong>Acesso operacional</strong></div>
                    <div class="detail-row"><span>Dados deste painel</span><strong>Demonstrativos</strong></div>
                </div><div class="info-banner">Esta versão é uma demonstração visual. Os dados ainda não são enviados a um servidor.</div>`)}
            </div>`;
    };

    const renderers = {
        'visao-geral': renderOverview,
        estoque: renderStock,
        doacoes: renderDonations,
        voluntarios: renderVolunteers,
        metas: renderGoals,
        financeiro: renderFinance,
        gestao: renderManagement
    };

    const renderPage = (page, options = {}) => {
        const activePage = renderers[page] ? page : 'visao-geral';
        navLinks.forEach((link) => {
            const selected = link.dataset.page === activePage;
            link.classList.toggle('is-active', selected);
            if (selected) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        renderers[activePage]();
        if (!options.keepScroll) {
            content.focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        sidebar.classList.remove('is-open');
        syncMenuState(false);
    };

    const syncMenuState = (open) => {
        const mobileOpen = mobileQuery.matches && open;
        sidebar.classList.toggle('is-open', mobileOpen);
        menuButton.setAttribute('aria-expanded', String(mobileOpen));
        menuBackdrop.hidden = !mobileOpen;
        document.body.classList.toggle('menu-open', mobileOpen);
        if (mobileQuery.matches && !mobileOpen) {
            sidebar.setAttribute('inert', '');
            sidebar.setAttribute('aria-hidden', 'true');
        } else {
            sidebar.removeAttribute('inert');
            sidebar.removeAttribute('aria-hidden');
        }
    };

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastRegion.append(toast);
        window.setTimeout(() => toast.remove(), 3500);
    };

    const updateOrganizationHeader = () => {
        document.querySelector('.organization strong').textContent = organization.name;
        document.querySelector('.organization div span').textContent = `${organization.city} · Unidade principal`;
    };

    const persistState = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                version: 2,
                records,
                stockRows,
                campaignGoals,
                demoSummary,
                organization
            }));
            return true;
        } catch (error) {
            showToast('O registro foi feito nesta tela, mas não pôde ser salvo neste navegador.');
            return false;
        }
    };

    const restoreState = () => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return;
            const saved = JSON.parse(stored);
            const valid = saved?.version === 2
                && Array.isArray(saved.stockRows)
                && Array.isArray(saved.campaignGoals)
                && saved.records
                && Object.keys(records).every((key) => Array.isArray(saved.records[key]))
                && saved.demoSummary
                && Object.keys(demoSummary).every((key) => Number.isFinite(saved.demoSummary[key]));
            const hasOrganization = saved.organization
                && Object.keys(organization).every((key) => typeof saved.organization[key] === 'string');
            if (!valid || !hasOrganization) throw new Error('Formato de dados salvo inválido.');
            stockRows.splice(0, stockRows.length, ...saved.stockRows);
            campaignGoals.splice(0, campaignGoals.length, ...saved.campaignGoals);
            Object.keys(records).forEach((key) => {
                records[key].splice(0, records[key].length, ...saved.records[key]);
            });
            Object.assign(demoSummary, saved.demoSummary);
            Object.assign(organization, saved.organization);
        } catch (error) {
            showToast('Não foi possível ler os dados salvos. A demonstração foi carregada com os dados de exemplo.');
        }
    };

    const field = (name, label, type = 'text', options = {}) => {
        const id = `field-${name}`;
        let control;
        if (type === 'select') {
            control = `<select id="${id}" name="${name}" ${options.required === false ? '' : 'required'}>
                ${options.choices.map(([value, labelText]) => `<option value="${escapeHtml(value)}">${escapeHtml(labelText)}</option>`).join('')}
            </select>`;
        } else if (type === 'textarea') {
            control = `<textarea id="${id}" name="${name}" placeholder="${escapeHtml(options.placeholder || '')}" ${options.required === false ? '' : 'required'}></textarea>`;
        } else {
            control = `<input id="${id}" name="${name}" type="${type}" ${options.required === false ? '' : 'required'} ${options.min !== undefined ? `min="${options.min}"` : ''} ${options.step ? `step="${options.step}"` : ''} placeholder="${escapeHtml(options.placeholder || '')}">`;
        }
        return `<div class="form-field ${options.full ? 'full' : ''}"><label for="${id}">${label}</label>${control}${options.hint ? `<small class="field-hint">${escapeHtml(options.hint)}</small>` : ''}</div>`;
    };

    const formDefinitions = {
        doacao: {
            title: 'Registrar doação',
            fields: [
                field('donor', 'Nome do doador'),
                field('date', 'Data', 'date'),
                field('category', 'Tipo de doação', 'select', { choices: [
                    ['financeira:pix', 'Financeira · Pix'],
                    ['financeira:transferencia', 'Financeira · transferência'],
                    ...stockRows.map((item) => [`alimento:${item.name}`, `Alimentos · ${item.name.toLocaleLowerCase('pt-BR')}`])
                ] }),
                field('quantity', 'Valor em reais', 'number', { min: 0.01, step: '0.01', hint: 'Para doações de alimentos, a quantidade será registrada em quilogramas.' })
            ],
            submit(values) {
                const [type, detail] = values.category.split(':');
                const amount = Number(values.quantity);
                if (!Number.isFinite(amount) || amount <= 0) throw new Error('Informe um valor maior que zero.');
                const donor = values.donor.trim();
                if (!donor) throw new Error('Informe o nome do doador.');
                if (type === 'financeira') {
                    const value = formatCurrency(amount);
                    demoSummary.financialDonations += amount;
                    demoSummary.financialDonationCount += 1;
                    demoSummary.uniqueDonors += 1;
                    records.financeiro.unshift({
                        date: formatDate(values.date),
                        description: `Doação ${detail === 'pix' ? 'via Pix' : 'por transferência'} · ${donor}`,
                        category: 'Doação financeira',
                        type: 'Entrada',
                        amount,
                        value: `+ ${value}`
                    });
                } else {
                    const item = stockRows.find((stockItem) => stockItem.name === detail);
                    if (!item) throw new Error('Selecione um alimento válido para esta doação.');
                    item.quantity = Math.round((item.quantity + amount) * 100) / 100;
                    item.days = Math.max(0, Math.floor(item.quantity / item.daily));
                    item.updated = `${formatDate(values.date)} · agora`;
                    demoSummary.foodDonationCount += 1;
                    demoSummary.foodDonationKg += amount;
                    demoSummary.uniqueDonors += 1;
                    records.estoque.unshift({
                        name: item.name,
                        type: 'Entrada',
                        quantity: `${amount} kg`,
                        source: donor,
                        date: formatDate(values.date)
                    });
                }
                records.doacoes.unshift({
                    donor,
                    date: formatDate(values.date),
                    category: type === 'financeira'
                        ? `Financeira · ${detail === 'pix' ? 'Pix' : 'transferência'}`
                        : `Alimentos · ${detail.toLocaleLowerCase('pt-BR')}`,
                    quantity: type === 'financeira' ? formatCurrency(amount) : `${amount} kg`
                });
                return { page: 'doacoes', message: 'Doação registrada. O financeiro e o estoque foram atualizados nesta demonstração.' };
            }
        },
        'estoque-entrada': {
            title: 'Registrar entrada no estoque',
            fields: [
                field('item', 'Alimento', 'select', { choices: stockRows.map((item) => [item.name, item.name]) }),
                field('quantity', 'Quantidade recebida', 'number', { min: 0.01, step: '0.01' }),
                field('date', 'Data', 'date'),
                field('source', 'Origem', 'text', { placeholder: 'Nome do doador ou fornecedor', full: true })
            ],
            submit(values) {
                updateStock(values, 1, 'Entrada');
                return { page: 'estoque', message: 'Entrada registrada e quantidade atualizada.' };
            }
        },
        'estoque-saida': {
            title: 'Registrar saída do estoque',
            fields: [
                field('item', 'Alimento', 'select', { choices: stockRows.map((item) => [item.name, item.name]) }),
                field('quantity', 'Quantidade utilizada', 'number', { min: 0.01, step: '0.01' }),
                field('date', 'Data', 'date'),
                field('reason', 'Motivo da saída', 'text', { placeholder: 'Ex.: preparo de refeições', full: true })
            ],
            submit(values) {
                const item = stockRows.find((stockItem) => stockItem.name === values.item);
                if (Number(values.quantity) > item.quantity) {
                    throw new Error(`A quantidade disponível de ${item.name} é ${item.quantity} ${item.unit}.`);
                }
                updateStock(values, -1, 'Saída');
                return { page: 'estoque', message: 'Saída registrada e quantidade atualizada.' };
            }
        },
        voluntario: {
            title: 'Cadastrar voluntário',
            fields: [
                field('name', 'Nome completo'),
                field('contact', 'E-mail', 'email'),
                field('role', 'Função', 'select', { choices: [['Distribuição de cestas', 'Distribuição de cestas'], ['Organização do estoque', 'Organização do estoque'], ['Preparo de refeições', 'Preparo de refeições'], ['Transporte e logística', 'Transporte e logística'], ['Apoio administrativo', 'Apoio administrativo']] }),
                field('availability', 'Disponibilidade', 'text', { placeholder: 'Ex.: sábados pela manhã', full: true })
            ],
            submit(values) {
                records.voluntarios.unshift({
                    ...values,
                    name: requireText(values.name, 'Nome completo'),
                    availability: requireText(values.availability, 'Disponibilidade'),
                    status: 'Ativo'
                });
                return { page: 'voluntarios', message: 'Voluntário cadastrado nesta demonstração.' };
            }
        },
        meta: {
            title: 'Criar meta',
            fields: [
                field('title', 'Nome da campanha'),
                field('metric', 'Tipo de meta', 'select', { choices: [['BRL', 'Arrecadação financeira (R$)'], ['kg', 'Alimentos (kg)'], ['voluntarios', 'Voluntários ativos']] }),
                field('target', 'Valor-alvo', 'number', { min: 0.01, step: 'any' }),
                field('date', 'Prazo', 'date'),
                field('description', 'Descrição', 'textarea', { full: true, required: false })
            ],
            submit(values) {
                const targetAmount = Number(values.target);
                if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
                    throw new Error('Informe um valor-alvo maior que zero.');
                }
                campaignGoals.push({
                    id: `meta-${Date.now()}`,
                    title: requireText(values.title, 'Nome da campanha'),
                    subtitle: values.description.trim() || 'Meta criada pela coordenação',
                    unit: values.metric,
                    currentAmount: 0,
                    targetAmount,
                    date: formatDate(values.date)
                });
                return { page: 'metas', message: 'Nova meta adicionada à página.' };
            }
        },
        'editar-meta': {
            title: 'Editar meta de arrecadação',
            fields: [
                field('title', 'Nome da campanha', 'text', { placeholder: 'Cestas que transformam' }),
                field('target', 'Novo valor-alvo', 'number', { min: 0.01, step: 'any' })
            ],
            submit(values, goalId) {
                const goal = campaignGoals.find((item) => item.id === goalId);
                if (!goal) throw new Error('Não foi possível localizar a meta selecionada.');
                const targetAmount = Number(values.target);
                if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
                    throw new Error('Informe um valor-alvo maior que zero.');
                }
                goal.targetAmount = targetAmount;
                goal.title = requireText(values.title, 'Nome da campanha');
                return { page: 'metas', message: 'Meta atualizada na página.' };
            }
        },
        movimentacao: {
            title: 'Registrar movimentação financeira',
            fields: [
                field('description', 'Descrição'),
                field('type', 'Tipo', 'select', { choices: [['Entrada', 'Entrada'], ['Saída', 'Saída']] }),
                field('category', 'Categoria', 'select', { choices: [['Doação financeira', 'Doação financeira'], ['Alimentos', 'Alimentos'], ['Transporte', 'Transporte'], ['Estrutura', 'Estrutura'], ['Materiais de apoio', 'Materiais de apoio']] }),
                field('value', 'Valor em reais', 'number', { min: 0.01, step: '0.01' }),
                field('date', 'Data', 'date')
            ],
            submit(values) {
                const numericAmount = Number(values.value);
                if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                    throw new Error('Informe um valor maior que zero.');
                }
                const amount = formatCurrency(numericAmount);
                records.financeiro.unshift({
                    date: formatDate(values.date),
                    description: requireText(values.description, 'Descrição'),
                    category: values.category,
                    type: values.type,
                    amount: numericAmount,
                    value: `${values.type === 'Entrada' ? '+' : '−'} ${amount}`
                });
                return { page: 'financeiro', message: 'Movimentação adicionada à lista desta demonstração.' };
            }
        },
        'editar-organizacao': {
            title: 'Editar dados da organização',
            fields: [
                field('name', 'Nome da organização', 'text', { placeholder: 'Instituto Mãos Unidas' }),
                field('city', 'Município e estado', 'text', { placeholder: 'Liberato, MG' }),
                field('email', 'E-mail de contato', 'email', { placeholder: 'contato@maosunidas.org' })
            ],
            submit(values) {
                organization.name = requireText(values.name, 'Nome da organização');
                organization.city = requireText(values.city, 'Município e estado');
                organization.email = requireText(values.email, 'E-mail de contato');
                return { page: 'gestao', message: 'Dados da organização atualizados neste navegador.' };
            }
        }
    };

    function formatDate(value) {
        value = value || demoDate;
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    }

    function requireText(value, label) {
        const trimmed = String(value || '').trim();
        if (!trimmed) throw new Error(`Preencha o campo "${label}".`);
        return trimmed;
    }

    function updateStock(values, direction, movementType) {
        const item = stockRows.find((stockItem) => stockItem.name === values.item);
        if (!item) throw new Error('Selecione um alimento válido.');
        const quantity = Number(values.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Informe uma quantidade maior que zero.');
        if (direction < 0 && quantity > item.quantity) {
            throw new Error(`A quantidade disponível de ${item.name} é ${item.quantity} ${item.unit}.`);
        }
        item.quantity = Math.round((item.quantity + quantity * direction) * 100) / 100;
        item.days = Math.max(0, Math.floor(item.quantity / item.daily));
        item.updated = `${formatDate(values.date)} · agora`;
        records.estoque.unshift({
            name: item.name,
            type: movementType,
            quantity: `${Number(values.quantity)} ${item.unit}`,
            source: values.source || values.reason || 'Registro manual',
            date: formatDate(values.date)
        });
    }

    const openDialog = (key, goalId = '') => {
        const definition = formDefinitions[key];
        if (!definition) return;
        if (key === 'estoque-saida') {
            definition.fields[0] = field('item', 'Alimento', 'select', {
                choices: stockRows.map((item) => [item.name, `${item.name} · ${item.quantity} ${item.unit}`])
            });
        } else if (key === 'estoque-entrada') {
            definition.fields[0] = field('item', 'Alimento', 'select', {
                choices: stockRows.map((item) => [item.name, `${item.name} · ${item.quantity} ${item.unit}`])
            });
        }
        dialogTitle.textContent = definition.title;
        dialogFields.innerHTML = definition.fields.join('');
        dialogForm.dataset.form = key;
        dialogForm.dataset.goalId = goalId;
        if (key === 'editar-meta') {
            const goal = campaignGoals.find((item) => item.id === goalId);
            if (goal) {
                dialogForm.elements.title.value = goal.title;
                dialogForm.elements.target.value = goal.targetAmount;
                dialogForm.elements.target.min = goal.unit === 'voluntarios' ? '1' : goal.unit === 'kg' ? '0.1' : '0.01';
                dialogForm.elements.target.step = goal.unit === 'voluntarios' ? '1' : goal.unit === 'kg' ? '0.1' : '0.01';
                dialogForm.querySelector('label[for="field-target"]').textContent = goal.unit === 'BRL'
                    ? 'Novo alvo (R$)'
                    : goal.unit === 'kg' ? 'Novo alvo (kg)' : 'Novo número de voluntários';
            }
        }
        if (key === 'editar-organizacao') {
            dialogForm.elements.name.value = organization.name;
            dialogForm.elements.city.value = organization.city;
            dialogForm.elements.email.value = organization.email;
        }
        const dateField = dialogForm.querySelector('[name="date"]');
        if (dateField) dateField.value = demoDate;
        dialog.showModal();
        dialog.querySelector('input, select, textarea')?.focus();
    };

    const applyTableControls = () => {
        const search = content.querySelector('[data-table-search]');
        const body = content.querySelector('.data-table tbody');
        if (!body) return;
        const query = search ? search.value.trim().toLocaleLowerCase('pt-BR') : '';
        const filters = [...content.querySelectorAll('[data-filter]')];
        const rows = [...body.rows].filter((row) => !row.hasAttribute('data-empty-state'));
        let visibleRows = 0;
        rows.forEach((row) => {
            const matchesSearch = !query || row.textContent.toLocaleLowerCase('pt-BR').includes(query);
            const matchesFilters = filters.every((filter) => {
                if (filter.value === 'all') return true;
                const text = row.textContent.toLocaleLowerCase('pt-BR');
                if (filter.dataset.filter === 'status') {
                    if (filter.value === 'warning') return text.includes('repor em breve');
                    if (filter.value === 'ok') return text.includes('estável');
                    if (filter.value === 'received') return text.includes('recebida');
                    if (filter.value === 'active') return text.includes('ativo');
                    if (filter.value === 'inactive') return text.includes('sem participação');
                }
                if (filter.dataset.filter === 'type') return text.includes(filter.value.toLocaleLowerCase('pt-BR'));
                if (filter.dataset.filter === 'category') return text.includes(filter.value.toLocaleLowerCase('pt-BR'));
                if (filter.dataset.filter === 'role') return text.includes(filter.value === 'distribution' ? 'distribuição de cestas' : 'organização do estoque');
                return true;
            });
            row.hidden = !matchesSearch || !matchesFilters;
            if (!row.hidden) visibleRows += 1;
        });
        const emptyState = body.querySelector('[data-empty-state]');
        if (emptyState) emptyState.hidden = visibleRows > 0;
    };

    const navigateTo = (page, options = {}) => {
        if (!renderers[page]) return;
        if (!options.fromHistory && window.location.hash !== `#${page}`) {
            window.history.pushState(null, '', `#${page}`);
        }
        renderPage(page);
    };

    document.addEventListener('click', (event) => {
        const pageLink = event.target.closest('[data-page]');
        if (pageLink) {
            event.preventDefault();
            navigateTo(pageLink.dataset.page);
            return;
        }

        const actionButton = event.target.closest('[data-action]');
        if (actionButton) {
            const action = actionButton.dataset.action;
            if (action === 'ajuda') {
                showToast('Esta demonstração ainda não possui atendimento conectado.');
            } else if (action === 'relatorio') {
                event.preventDefault();
                showToast('Os valores exibidos são demonstrativos; exportação de relatórios ainda não está disponível.');
            } else {
                openDialog(action, actionButton.dataset.goalId || '');
            }
            return;
        }

        if (event.target.closest('.dialog-close, .dialog-cancel')) dialog.close();
    });

    content.addEventListener('input', (event) => {
        if (event.target.matches('[data-table-search]')) applyTableControls();
    });

    content.addEventListener('change', (event) => {
        if (event.target.matches('[data-filter]')) applyTableControls();
    });

    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });

    dialogForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const definition = formDefinitions[dialogForm.dataset.form];
        const values = Object.fromEntries(new FormData(dialogForm).entries());
        try {
            const result = definition.submit(values, dialogForm.dataset.goalId);
            const saved = persistState();
            dialog.close();
            updateOrganizationHeader();
            renderPage(result.page, { keepScroll: true });
            if (saved) showToast(result.message);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Não foi possível salvar o registro.');
        }
    });

    dialogForm.addEventListener('change', (event) => {
        if (dialogForm.dataset.form === 'doacao' && event.target.name === 'category') {
            const isFinancial = event.target.value.startsWith('financeira:');
            const quantityLabel = dialogForm.querySelector('label[for="field-quantity"]');
            const quantityInput = dialogForm.elements.quantity;
            const hint = dialogForm.querySelector('.field-hint');
            quantityLabel.textContent = isFinancial ? 'Valor em reais' : 'Quantidade em kg';
            quantityInput.min = isFinancial ? '0.01' : '0.1';
            quantityInput.step = isFinancial ? '0.01' : '0.1';
            hint.textContent = isFinancial
                ? 'Informe o valor recebido em reais.'
                : 'Informe o peso recebido em quilogramas.';
        }
        if (dialogForm.dataset.form === 'meta' && event.target.name === 'metric') {
            const targetLabel = dialogForm.querySelector('label[for="field-target"]');
            targetLabel.textContent = event.target.value === 'BRL'
                ? 'Valor-alvo em reais'
                : event.target.value === 'kg' ? 'Quantidade-alvo em kg' : 'Número-alvo de voluntários';
            dialogForm.elements.target.min = event.target.value === 'BRL' ? '0.01' : event.target.value === 'kg' ? '0.1' : '1';
            dialogForm.elements.target.step = event.target.value === 'BRL' ? '0.01' : event.target.value === 'kg' ? '0.1' : '1';
        }
    });

    menuButton.addEventListener('click', () => {
        const open = !sidebar.classList.contains('is-open');
        syncMenuState(open);
        if (open) sidebar.querySelector('.nav-link')?.focus();
    });

    menuBackdrop.addEventListener('click', () => {
        syncMenuState(false);
        menuButton.focus();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
            syncMenuState(false);
            menuButton.focus();
        }
    });

    mobileQuery.addEventListener('change', () => syncMenuState(false));

    window.addEventListener('popstate', () => {
        renderPage(window.location.hash.slice(1), { fromHistory: true, keepScroll: true });
    });

    restoreState();
    updateOrganizationHeader();
    syncMenuState(false);
    const initialPage = window.location.hash.slice(1);
    renderPage(renderers[initialPage] ? initialPage : 'visao-geral', { keepScroll: true });
});
