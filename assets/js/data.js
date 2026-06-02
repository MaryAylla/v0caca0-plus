// js/data.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos do HTML
    const containerCursos = document.getElementById('container-cursos');
    const paginacaoCursos = document.getElementById('paginacao-cursos');
    const infoResultados = document.getElementById('info-resultados');
    const inputPesquisa = document.getElementById('input-pesquisa');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnLimpar = document.getElementById('btn-limpar');

    // Variáveis de Estado
    let cursosAgrupadosOriginais = [];
    let cursosFiltrados = [];
    let paginaAtual = 1;
    const itensPorPagina = 5;

    // Função que remove acentos e espaços para comparar textos
    const normalizarTexto = (texto) => {
        if (!texto) return "";
        return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
    };

    // 1. Busca os dados no JSON gerado pelo Node.js
    const carregarCursos = async () => {
        try {
            const resposta = await fetch('assets/data/cursos.json');
            if (!resposta.ok) throw new Error('Falha no JSON');
            
            const dadosBrutos = await resposta.json();
            cursosAgrupadosOriginais = agruparEOrdenarCursos(dadosBrutos);
            cursosFiltrados = [...cursosAgrupadosOriginais];
            
            atualizarTela();
        } catch (erro) {
            console.error(erro);
            containerCursos.innerHTML = `<div class="alert alert-danger w-100 text-center">Erro ao carregar dados. Verifique o console.</div>`;
        }
    };

    // 2. Agrupa os cursos repetidos no mesmo card
    const agruparEOrdenarCursos = (cursos) => {
        const agrupamento = {};
        cursos.forEach(curso => {
            const nomeNormalizado = normalizarTexto(curso.nome); 
            if (!agrupamento[nomeNormalizado]) {
                agrupamento[nomeNormalizado] = {
                    nome: curso.nome.trim(),
                    descricao: curso.descricao,
                    areaAtuacao: curso.areaAtuacao,
                    mediaSalarial: curso.mediaSalarial,
                    eixo: normalizarTexto(curso.eixo), // <--- Lendo a nova coluna manual do Excel!
                    ofertas: []
                };
            }
            agrupamento[nomeNormalizado].ofertas.push({
                instituicao: curso.instituicao,
                tipo: curso.tipo,
                modalidade: curso.modalidade,
                turno: curso.turno,
                duracao: curso.duracao,
                formaIngresso: curso.formaIngresso,
                notaCorte: curso.notaCorte,
                numeroVagas: curso.numeroVagas,
                mediaFormandos: curso.mediaFormandos,
                linkCurso: curso.linkCurso
            });
        });
        return Object.values(agrupamento).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    };

    // 3. Aplica todos os filtros selecionados na barra lateral
    const aplicarFiltros = () => {
        const termo = normalizarTexto(inputPesquisa.value);
        
        // Captura o que o usuário marcou
        const ordemElement = document.querySelector('input[name="ordem"]:checked');
        const ordemSelecionada = ordemElement ? ordemElement.value : 'az';
        
        const instMarcadas = Array.from(document.querySelectorAll('input[name="instituicao"]:checked')).map(cb => normalizarTexto(cb.value));
        const modMarcadas = Array.from(document.querySelectorAll('input[name="modalidade"]:checked')).map(cb => normalizarTexto(cb.value));
        const duracaoMarcadas = Array.from(document.querySelectorAll('input[name="duracao"]:checked')).map(cb => cb.value);
        const areasMarcadas = Array.from(document.querySelectorAll('input[name="area"]:checked')).map(cb => normalizarTexto(cb.value));

        // Esconde ou mostra o botão "Limpar Filtros"
        if(termo || instMarcadas.length > 0 || modMarcadas.length > 0 || duracaoMarcadas.length > 0 || areasMarcadas.length > 0) {
            btnLimpar.classList.remove('d-none');
        } else {
            btnLimpar.classList.add('d-none');
        }

        // Filtra as faculdades dentro do card e a duração
        cursosFiltrados = cursosAgrupadosOriginais.map(curso => {
            const ofertasFiltradas = curso.ofertas.filter(oferta => {
                const passaInst = instMarcadas.length === 0 || instMarcadas.includes(normalizarTexto(oferta.instituicao));
                const passaMod = modMarcadas.length === 0 || modMarcadas.some(mod => normalizarTexto(oferta.modalidade).includes(mod));
                
                const passaDuracao = duracaoMarcadas.length === 0 || duracaoMarcadas.some(d => {
                    const numSemestres = parseInt(String(oferta.duracao).replace(/\D/g, ''));
                    if (isNaN(numSemestres)) return true; 
                    if (d === 'curto') return numSemestres <= 5;
                    if (d === 'medio') return numSemestres > 5 && numSemestres <= 8;
                    if (d === 'longo') return numSemestres > 8;
                    return false;
                });

                return passaInst && passaMod && passaDuracao;
            });
            return { ...curso, ofertas: ofertasFiltradas };

        // Filtra o card inteiro por nome, pesquisa ou pela sua nova coluna "Área"
        // (Trecho NOVO e Flexível)
        }).filter(curso => {
            const passaPesquisa = normalizarTexto(curso.nome).includes(termo) || (curso.descricao && normalizarTexto(curso.descricao).includes(termo));
            
            // Agora o filtro checa se a palavra do checkbox está CONTIDA no que você digitou no Excel
            const passaArea = areasMarcadas.length === 0 || areasMarcadas.some(area => curso.eixo && curso.eixo.includes(area));

            return curso.ofertas.length > 0 && passaPesquisa && passaArea;
        });

        // Ordenação A-Z ou Z-A
        cursosFiltrados.sort((a, b) => {
            if (ordemSelecionada === 'za') {
                return b.nome.localeCompare(a.nome, 'pt-BR');
            }
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });

        paginaAtual = 1; 
        atualizarTela();
    };

    // 4. Prepara a fatia (slice) de cursos da página atual
    const atualizarTela = () => {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const cursosDaPagina = cursosFiltrados.slice(inicio, fim);

        infoResultados.innerHTML = `Mostrando <b>${cursosDaPagina.length}</b> de <b>${cursosFiltrados.length}</b> resultados encontrados.`;

        if (cursosFiltrados.length === 0) {
            containerCursos.innerHTML = `
                <div class="text-center py-5 w-100">
                    <h5 class="text-indigo fw-bold">Nenhum curso encontrado</h5>
                    <p class="text-muted">Tente ajustar seus filtros ou mudar o termo da pesquisa.</p>
                </div>
            `;
            paginacaoCursos.innerHTML = '';
            return;
        }

        renderizarCards(cursosDaPagina);
        renderizarBotoesPaginacao();
    };

    // 5. Gera os botões de paginação dinamicamente
    const renderizarBotoesPaginacao = () => {
        const totalPaginas = Math.ceil(cursosFiltrados.length / itensPorPagina);
        paginacaoCursos.innerHTML = '';

        if (totalPaginas <= 1) return;

        paginacaoCursos.insertAdjacentHTML('beforeend', `
            <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
                <a class="page-link shadow-none cursor-pointer" onclick="mudarPagina(${paginaAtual - 1})">&laquo; Ant</a>
            </li>
        `);

        let paginaInicial = Math.max(1, paginaAtual - 2);
        let paginaFinal = Math.min(totalPaginas, paginaAtual + 2);

        if (paginaInicial === 1) paginaFinal = Math.min(5, totalPaginas);
        if (paginaFinal === totalPaginas) paginaInicial = Math.max(1, totalPaginas - 4);

        for (let i = paginaInicial; i <= paginaFinal; i++) {
            const ativo = paginaAtual === i ? 'active' : '';
            paginacaoCursos.insertAdjacentHTML('beforeend', `
                <li class="page-item ${ativo}">
                    <a class="page-link shadow-none cursor-pointer" onclick="mudarPagina(${i})">${i}</a>
                </li>
            `);
        }

        paginacaoCursos.insertAdjacentHTML('beforeend', `
            <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link shadow-none cursor-pointer" onclick="mudarPagina(${paginaAtual + 1})">Próx &raquo;</a>
            </li>
        `);
    };

    // Função exposta para o HTML poder chamar ao clicar na página
    window.mudarPagina = (novaPagina) => {
        const totalPaginas = Math.ceil(cursosFiltrados.length / itensPorPagina);
        if (novaPagina >= 1 && novaPagina <= totalPaginas) {
            paginaAtual = novaPagina;
            atualizarTela();
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };

    // 6. Injeta o HTML dos cards na tela
    const renderizarCards = (cursos) => {
        containerCursos.innerHTML = cursos.map(curso => `
            <div class="col-12 mb-4">
                <div class="card-figma w-100">
                    <div class="row">
                        <div class="col-md-6 border-end pe-4">
                            <h3 class="fw-800 text-indigo mb-4">${curso.nome}</h3>
                            <h5 class="text-indigo fw-bold mb-2">Sobre o curso</h5>
                            <p class="text-muted small mb-4" style="text-align: justify;">${curso.descricao || 'Descrição não informada.'}</p>
                            <div class="row">
                                <div class="col-sm-7">
                                    <h5 class="text-indigo fw-bold mb-2">Áreas de atuação</h5>
                                    <ul class="text-muted small">${curso.areaAtuacao ? curso.areaAtuacao.split(',').map(a => `<li>${a.trim()}</li>`).join('') : '<li>Diversas</li>'}</ul>
                                </div>
                                <div class="col-sm-5">
                                    <h5 class="text-indigo fw-bold mb-2">Média salarial</h5>
                                    <p class="text-muted fw-bold text-vibrant fs-5">${curso.mediaSalarial || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6 ps-4">
                            <h5 class="text-indigo fw-bold mb-3">Onde estudar no Cariri (${curso.ofertas.length} opções)</h5>
                            <div class="ofertas-container pe-2" style="max-height: 340px; overflow-y: auto;">
                                ${curso.ofertas.map(oferta => `
                                    <div class="border rounded-3 p-3 mb-3 bg-light hover-up">
                                        <div class="d-flex justify-content-between align-items-start mb-2">
                                            <div class="d-flex align-items-center">
                                                <div class="bg-white rounded-circle d-flex align-items-center justify-content-center border border-vibrant text-vibrant me-2" style="width: 40px; height: 40px;"><i class="fas fa-university"></i></div>
                                                
                                                <a href="${oferta.linkCurso && oferta.linkCurso.trim() !== '' ? oferta.linkCurso : '#'}" target="_blank" class="text-decoration-none hover-link" title="Ir para a página do curso">
                                                    <h6 class="fw-bold text-vibrant mb-0 text-uppercase">
                                                        ${oferta.instituicao || 'N/A'} <i class="fas fa-external-link-alt ms-1 small"></i>
                                                    </h6>
                                                </a>
                                            </div>
                                            <div class="text-end">
                                                <span class="d-block text-muted" style="font-size: 0.7rem;">Nota de Corte</span>
                                                <span class="badge bg-dark-blue text-white fs-6">${oferta.notaCorte || '-'}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex flex-wrap gap-2 mt-2 mb-2">
                                            <span class="badge bg-white text-muted border border-secondary border-opacity-25 fw-normal"><i class="fas fa-graduation-cap me-1 text-vibrant"></i>${oferta.tipo || '-'}</span>
                                            <span class="badge bg-white text-muted border border-secondary border-opacity-25 fw-normal"><i class="fas fa-map-marker-alt me-1 text-vibrant"></i>${oferta.modalidade || '-'}</span>
                                            <span class="badge bg-white text-muted border border-secondary border-opacity-25 fw-normal"><i class="fas fa-sun me-1 text-vibrant"></i>${oferta.turno || '-'}</span>
                                        </div>

                                        <hr class="border-secondary opacity-10 my-2">

                                        <div class="d-flex justify-content-between text-muted small">
                                            <span><i class="fas fa-users me-1 text-indigo"></i> <b>Vagas:</b> ${oferta.numeroVagas || '-'}</span>
                                            <span><i class="fas fa-user-graduate me-1 text-indigo"></i> <b>Formam:</b> ${oferta.mediaFormandos || '-'}</span>
                                            <span><i class="fas fa-door-open me-1 text-indigo"></i> <b>Ingresso:</b> ${oferta.formaIngresso || '-'}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join(''); 
    };

    // 7. Eventos de Clique
    btnFiltrar.addEventListener('click', aplicarFiltros);
    inputPesquisa.addEventListener('input', aplicarFiltros); 

    btnLimpar.addEventListener('click', () => {
        // Desmarca todas as caixinhas
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        // Volta a ordem para A-Z
        const ordemAz = document.getElementById('ordem-az');
        if(ordemAz) ordemAz.checked = true; 
        
        inputPesquisa.value = '';
        aplicarFiltros();
    });

    carregarCursos();
});