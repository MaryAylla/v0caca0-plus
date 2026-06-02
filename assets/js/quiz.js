// js/quiz.js

document.addEventListener('DOMContentLoaded', () => {

    // Banco com as 40 perguntas exatas do seu documento Word
    const bancoDePerguntas = [
        // Prático e Técnico (Mão na Massa)
        { id: 1, eixo: "Prático", texto: "Eu prefiro atividades que envolvam o uso de ferramentas ou máquinas." },
        { id: 2, eixo: "Prático", texto: "Gosto de entender como os objetos funcionam por dentro." },
        { id: 3, eixo: "Prático", texto: "Prefiro trabalhar ao ar livre do que em um escritório fechado." },
        { id: 4, eixo: "Prático", texto: "Tenho facilidade em consertar coisas que quebraram em casa." },
        { id: 5, eixo: "Prático", texto: "Atividades físicas e manuais me dão mais satisfação do que tarefas puramente intelectuais." },
        { id: 6, eixo: "Prático", texto: "Eu me sinto bem executando projetos que entregam um resultado físico e visível." },
        
        // Analítico e Investigativo (Ciência e Lógica)
        { id: 7, eixo: "Analítico", texto: "Eu gosto de passar tempo resolvendo problemas matemáticos ou lógicos complexos." },
        { id: 8, eixo: "Analítico", texto: "Tenho muita curiosidade sobre como o universo e a natureza funcionam." },
        { id: 9, eixo: "Analítico", texto: "Eu prefiro ler artigos científicos ou técnicos do que obras de ficção." },
        { id: 10, eixo: "Analítico", texto: "Gosto de investigar as causas de um problema antes de tentar resolvê-lo." },
        { id: 11, eixo: "Analítico", texto: "Trabalhar em um laboratório ou com análise de dados parece algo estimulante." },
        { id: 12, eixo: "Analítico", texto: "Eu me sinto confortável lidando com teorias e conceitos abstratos." },

        // Criativo e Expressivo (Artes e Design)
        { id: 13, eixo: "Criativo", texto: "Eu valorizo muito a liberdade de criação no meu dia a dia." },
        { id: 14, eixo: "Criativo", texto: "Gosto de me expressar através da música, escrita, desenho ou outras artes." },
        { id: 15, eixo: "Criativo", texto: "Eu reparo facilmente na estética e no design das coisas ao meu redor." },
        { id: 16, eixo: "Criativo", texto: "Prefiro ambientes de trabalho informais e visualmente estimulantes." },
        { id: 17, eixo: "Criativo", texto: "Muitas vezes encontro soluções 'fora da caixa' para os problemas." },
        { id: 18, eixo: "Criativo", texto: "Eu me sinto atraído por profissões que permitam inovação constante." },

        // Social e Empático (Cuidado e Ensino)
        { id: 19, eixo: "Social", texto: "Ajudar outras pessoas a resolverem seus problemas me traz muita satisfação." },
        { id: 20, eixo: "Social", texto: "Eu me sinto à vontade ensinando algo novo para alguém." },
        { id: 21, eixo: "Social", texto: "Prefiro trabalhar em equipe do que realizar tarefas sozinho." },
        { id: 22, eixo: "Social", texto: "Eu tenho facilidade em perceber quando alguém ao meu redor não está bem." },
        { id: 23, eixo: "Social", texto: "Projetos que geram impacto social positivo são prioridade para mim." },
        { id: 24, eixo: "Social", texto: "Gosto de ouvir as histórias de vida e as experiências das pessoas." },

        // Liderança e Negócios (Empreendedorismo)
        { id: 25, eixo: "Liderança", texto: "Eu me sinto confortável tomando decisões importantes sob pressão." },
        { id: 26, eixo: "Liderança", texto: "Gosto de convencer as pessoas sobre as minhas ideias e projetos." },
        { id: 27, eixo: "Liderança", texto: "Tenho facilidade em liderar grupos e organizar tarefas coletivas." },
        { id: 28, eixo: "Liderança", texto: "O mundo dos negócios, startups e vendas me desperta interesse." },
        { id: 29, eixo: "Liderança", texto: "Eu me considero uma pessoa competitiva e focada em metas." },
        { id: 30, eixo: "Liderança", texto: "Gosto de assumir riscos se houver uma chance clara de sucesso." },

        // Organizacional e Detalhista (Administração e Dados)
        { id: 31, eixo: "Organizacional", texto: "Eu me sinto satisfeito quando consigo organizar informações em planilhas ou listas." },
        { id: 32, eixo: "Organizacional", texto: "Prefiro seguir instruções claras e rotinas bem definidas." },
        { id: 33, eixo: "Organizacional", texto: "Sou uma pessoa muito atenta aos detalhes que outros costumam ignorar." },
        { id: 34, eixo: "Organizacional", texto: "Manter documentos e registros organizados é algo natural para mim." },
        { id: 35, eixo: "Organizacional", texto: "Eu prefiro ambientes de trabalho estruturados e com regras claras." },
        { id: 36, eixo: "Organizacional", texto: "Gosto de planejar tudo com antecedência para evitar imprevistos." },

        // Tecnologia e Inovação Digital
        { id: 37, eixo: "Tecnologia", texto: "Eu me interesso por aprender linguagens de programação ou entender algoritmos." },
        { id: 38, eixo: "Tecnologia", texto: "Acompanhar as últimas tendências tecnológicas é um dos meus passatempos." },
        { id: 39, eixo: "Tecnologia", texto: "Eu me sinto confortável usando ferramentas digitais para otimizar meu trabalho." },
        { id: 40, eixo: "Tecnologia", texto: "Desenvolver novos softwares ou soluções digitais parece uma carreira empolgante." }
    ];

    // Elementos do HTML
    const containerQuiz = document.getElementById('container-quiz');
    const barraProgresso = document.getElementById('barra-progresso');
    const statusTexto = document.getElementById('status-texto');
    const statusPorcentagem = document.getElementById('status-porcentagem');
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');

    // Variáveis de Estado (Paginação)
    let paginaAtualIndex = 0; 
    const perguntasPorPagina = 5;
    const totalPaginas = Math.ceil(bancoDePerguntas.length / perguntasPorPagina);
    let respostasDoUsuario = {}; 

    // 1. Renderiza a página atual com as 5 perguntas
    const renderizarPagina = () => {
        const inicio = paginaAtualIndex * perguntasPorPagina;
        const fim = inicio + perguntasPorPagina;
        const perguntasDaPagina = bancoDePerguntas.slice(inicio, fim);

        let html = '';

        perguntasDaPagina.forEach((pergunta, index) => {
            const numPerguntaReal = inicio + index + 1;
            const respostaSalva = respostasDoUsuario[pergunta.id];

            html += `
                <div class="mb-5 pb-4 ${index !== perguntasDaPagina.length -1 ? 'border-bottom border-light' : ''}">
                    <h5 class="text-indigo fw-800 mb-4">
                        <span class="text-vibrant me-2">${numPerguntaReal}.</span> ${pergunta.texto}
                    </h5>
                    
                    <div class="d-flex flex-column gap-2 ms-4" id="grupo-pergunta-${pergunta.id}">
                        <button class="btn ${respostaSalva === 5 ? 'btn-indigo' : 'btn-outline-primary bg-white'} text-start px-4 py-3 fw-bold rounded-pill" onclick="selecionarResposta(${pergunta.id}, 5, this)">
                            <i class="fas fa-check-double me-2"></i> Concordo Totalmente
                        </button>
                        <button class="btn ${respostaSalva === 4 ? 'btn-indigo' : 'btn-outline-primary bg-white'} text-start px-4 py-3 fw-bold rounded-pill" onclick="selecionarResposta(${pergunta.id}, 4, this)">
                            <i class="fas fa-check me-2"></i> Concordo Parcialmente
                        </button>
                        <button class="btn ${respostaSalva === 3 ? 'btn-indigo' : 'btn-outline-primary bg-white'} text-start px-4 py-3 fw-bold rounded-pill" onclick="selecionarResposta(${pergunta.id}, 3, this)">
                            <i class="fas fa-minus me-2"></i> Neutro / Não sei
                        </button>
                        <button class="btn ${respostaSalva === 2 ? 'btn-indigo' : 'btn-outline-primary bg-white'} text-start px-4 py-3 fw-bold rounded-pill" onclick="selecionarResposta(${pergunta.id}, 2, this)">
                            <i class="fas fa-times me-2"></i> Discordo Parcialmente
                        </button>
                        <button class="btn ${respostaSalva === 1 ? 'btn-indigo' : 'btn-outline-primary bg-white'} text-start px-4 py-3 fw-bold rounded-pill" onclick="selecionarResposta(${pergunta.id}, 1, this)">
                            <i class="fas fa-times-circle me-2"></i> Discordo Totalmente
                        </button>
                    </div>
                </div>
            `;
        });

        // Aplica o padding para a barra azul do rodapé não bugar
        containerQuiz.innerHTML = `<div class="p-4 p-md-5">${html}</div>`;
        
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela suavemente ao mudar de página
        atualizarProgressoE_Botoes();
    };

    // 2. Quando o usuário clica em uma resposta
    window.selecionarResposta = (idPergunta, valor, botaoClicado) => {
        respostasDoUsuario[idPergunta] = valor;

        // Pinta apenas os botões daquela pergunta específica
        const todosBotoes = document.getElementById(`grupo-pergunta-${idPergunta}`).querySelectorAll('button');
        todosBotoes.forEach(btn => {
            btn.classList.remove('btn-indigo');
            btn.classList.add('btn-outline-primary', 'bg-white');
        });
        botaoClicado.classList.remove('btn-outline-primary', 'bg-white');
        botaoClicado.classList.add('btn-indigo');

        atualizarProgressoE_Botoes();
    };

    // 3. Atualiza Barra e valida se o aluno pode avançar
    const atualizarProgressoE_Botoes = () => {
        const paginaReal = paginaAtualIndex + 1;
        const porcentagem = ((paginaReal / totalPaginas) * 100).toFixed(0);

        barraProgresso.style.width = `${porcentagem}%`;
        statusTexto.innerText = `Página ${paginaReal} de ${totalPaginas}`;
        statusPorcentagem.innerText = `${porcentagem}% completo`;

        btnAnt.disabled = paginaAtualIndex === 0;

        // 🧠 INTELIGÊNCIA: Verifica se todas as 5 perguntas DESTA página foram respondidas
        const inicio = paginaAtualIndex * perguntasPorPagina;
        const fim = inicio + perguntasPorPagina;
        const perguntasDaPagina = bancoDePerguntas.slice(inicio, fim);
        
        const todasRespondidas = perguntasDaPagina.every(pergunta => respostasDoUsuario[pergunta.id] !== undefined);

        if (paginaAtualIndex === totalPaginas - 1) {
            btnProx.innerText = "Finalizar e Ver Resultado";
            btnProx.classList.replace('btn-indigo', 'btn-success');
            btnProx.disabled = !todasRespondidas; 
        } else {
            btnProx.innerText = "Próxima Página";
            btnProx.classList.replace('btn-success', 'btn-indigo');
            btnProx.disabled = !todasRespondidas;
        }
    };

    // 4. Ação dos Botões
    btnAnt.addEventListener('click', () => {
        if (paginaAtualIndex > 0) {
            paginaAtualIndex--;
            renderizarPagina();
        }
    });

    btnProx.addEventListener('click', () => {
        if (paginaAtualIndex < totalPaginas - 1) {
            paginaAtualIndex++;
            renderizarPagina();
        } else {
            finalizarQuiz();
        }
    });

    // 5. Finalizar
    const finalizarQuiz = () => {
        const dadosCompletos = {
            respostas: respostasDoUsuario,
            perguntasInfo: bancoDePerguntas
        };
        localStorage.setItem('vocacaoPlus_respostas', JSON.stringify(dadosCompletos));
        window.location.href = "resultado.html";
    };

    // Start!
    renderizarPagina();
});