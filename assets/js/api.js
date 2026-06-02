// js/api.js

document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // 🎛️ CONTROLE DE AMBIENTE (CHAVE DE TRILHO)
    // =======================================================================
    // Mude para 'false' apenas no dia que for colocar o site no ar pela Vercel!
    const MODO_DESENVOLVIMENTO = false; 
    
    // Deixe vazio ou com um texto falso. NENHUMA CHAVE REAL PODE FICAR AQUI!
    const GEMINI_API_KEY_LOCAL = "PROTEGIDO_NA_VERCEL";

    const telaCarregamento = document.getElementById('tela-carregamento');
    const telaResultado = document.getElementById('tela-resultado');
    const elEixo = document.getElementById('res-eixo');
    const elAnalise = document.getElementById('res-analise');
    const elCursos = document.getElementById('res-cursos');

    // Resgatar as respostas
    const dadosSalvos = localStorage.getItem('vocacaoPlus_respostas');
    if (!dadosSalvos) {
        window.location.href = "index.html";
        return;
    }

    const { respostas, perguntasInfo } = JSON.parse(dadosSalvos);

    // Calcular a pontuação
    const pontuacaoPorEixo = {};
    perguntasInfo.forEach(pergunta => {
        const eixo = pergunta.eixo;
        const nota = respostas[pergunta.id] || 0; 
        if (!pontuacaoPorEixo[eixo]) pontuacaoPorEixo[eixo] = 0;
        pontuacaoPorEixo[eixo] += nota;
    });

    let eixoVencedor = "";
    let maiorNota = -1;
    for (const [eixo, nota] of Object.entries(pontuacaoPorEixo)) {
        if (nota > maiorNota) {
            maiorNota = nota;
            eixoVencedor = eixo;
        }
    }

    elEixo.innerText = eixoVencedor.toUpperCase();

    // Prompt (Sintaxe de colchetes e vírgulas corrigida para o JSON)
    const promptParaIA = `
        Você é um orientador vocacional de um projeto chamado 'Vocação Plus', no Cariri, Ceará.
        Eixo dominante do aluno: "${eixoVencedor}".
        Pontuação: ${JSON.stringify(pontuacaoPorEixo)}.

        Escreva uma análise psicológica vocacional inspiradora.
        RETORNE EXATAMENTE UM JSON, SEM TEXTO ANTES OU DEPOIS.

        {
            "eixo_principal": "${eixoVencedor}",
            "analise": "Um texto de 2 parágrafos elogiando as habilidades do aluno e dando incentivo.",
            "cursos_sugeridos": [
                {
                    "name": "Nome do Curso 1",
                    "descricao": "Explicação de 2 linhas sobre o curso e o motivo de combinar com o aluno."
                },
                {
                    "name": "Nome do Curso 2",
                    "descricao": "Explicação de 2 linhas..."
                },
                {
                    "name": "Nome do Curso 3",
                    "descricao": "Explicação de 2 linhas..."
                }
            ]
        }
    `;

    // Conexão com a IA
    const consultarGemini = async () => {
        let resultadoFinal;

        // BLOCO 1: Busca os dados (Decide se usa o Local ou a Vercel)
        try {
            if (MODO_DESENVOLVIMENTO) {
                // 💻 RODA DIRETO NO NAVEGADOR (Para terminar os testes do TCC localmente)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY_LOCAL}`;
                const resposta = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: promptParaIA }] }] })
                });

                if (!resposta.ok) {
                    const erroDetalhado = await resposta.text();
                    throw new Error(`Google recusou a chave local: ${erroDetalhado}`);
                }

                const dadosAPI = await resposta.json();
                let respostaTexto = dadosAPI.candidates[0].content.parts[0].text;
                respostaTexto = respostaTexto.replace(/```json/g, "").replace(/```/g, "").trim();
                resultadoFinal = JSON.parse(respostaTexto);

            } else {
                // ☁️ RODA VIA BACK-END VERCEL (Seguro para o TCC em produção)
                // Caminho corrigido para bater diretamente com a API Serverless da raiz
                const resposta = await fetch('/api/gerar-analise', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: promptParaIA })
                });

                if (!resposta.ok) throw new Error("Erro de comunicação com o servidor Vercel.");
                resultadoFinal = await resposta.json();
            }

        } catch (erro) {
            console.error("🕵️ ERRO NA API:", erro);
            elAnalise.innerText = "Houve um erro de comunicação. Verifique o console para detalhes.";
            elCursos.innerHTML = `<li class="text-danger small">Cursos indisponíveis.</li>`;
            telaCarregamento.classList.add('d-none');
            telaResultado.classList.remove('d-none');
            return; 
        }

        // BLOCO 2: Renderiza os textos na tela
        try {
            elEixo.innerText = resultadoFinal.eixo_principal;
            elAnalise.innerText = resultadoFinal.analise;
            elCursos.innerHTML = "";
            
            resultadoFinal.cursos_sugeridos.forEach(curso => {
                elCursos.innerHTML += `
                    <li class="mb-3 p-3 bg-white rounded-3 border-start border-primary border-4 shadow-sm hover-up">
                        <h6 class="fw-bold text-indigo mb-1">${curso.nome || curso.name}</h6>
                        <p class="text-muted small mb-0" style="line-height: 1.4;">${curso.descricao}</p>
                    </li>
                `;
            });
            
            telaCarregamento.classList.add('d-none');
            telaResultado.classList.remove('d-none');
        } catch (erro) {
            console.error("🕵️ ERRO NA RENDERIZAÇÃO DO TEXTO:", erro);
        }

        // BLOCO 3: Desenha o Gráfico
        setTimeout(() => {
            try {
                const canvas = document.getElementById('graficoVocacional');
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
                const labels = Object.keys(pontuacaoPorEixo);
                const valores = Object.values(pontuacaoPorEixo);

                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Sua Afinidade',
                            data: valores,
                            fill: true,
                            backgroundColor: 'rgba(21, 101, 192, 0.2)', 
                            borderColor: '#1565C0', 
                            pointBackgroundColor: '#1565C0',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#1565C0'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false, 
                        elements: { line: { borderWidth: 3 } },
                        scales: { r: { angleLines: { display: true }, suggestedMin: 0, ticks: { display: false } } },
                        plugins: { legend: { display: false } }
                    }
                });
            } catch (erro) {
                console.error("🕵️ ERRO NO GRÁFICO:", erro);
            }
        }, 200); 
    };

    // Lógica do Feedback
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.addEventListener('click', function() {
            const val = this.getAttribute('data-value');
            document.getElementById('fb-rating').value = val;
            document.querySelectorAll('.star-rating i').forEach((s, index) => {
                if (index < val) s.classList.replace('far', 'fas'); 
                else s.classList.replace('fas', 'far'); 
            });
        });
        star.addEventListener('mouseover', function() { this.style.transform = 'scale(1.2)'; });
        star.addEventListener('mouseout', function() { this.style.transform = 'scale(1)'; });
    });

    window.enviarFeedback = () => {
        const nome = document.getElementById('fb-nome').value;
        const nota = document.getElementById('fb-rating').value;
        const msg = document.getElementById('fb-comentario').value;

        if(!nome || nota == 0) {
            alert("Por favor, preencha o seu nome e selecione uma estrela!");
            return;
        }

        let avaliacoes = JSON.parse(localStorage.getItem('vocacaoPlus_avaliacoes')) || [];
        avaliacoes.unshift({
            nome: nome,
            nota: parseInt(nota),
            comentario: msg || "Sem comentário.",
            data: new Date().toLocaleDateString(),
            liked: false,
            starred: false
        });
        localStorage.setItem('vocacaoPlus_avaliacoes', JSON.stringify(avaliacoes));

        document.getElementById('fb-msg').classList.remove('d-none');
        document.querySelector('.col-md-8 button').disabled = true;
        document.querySelector('.col-md-8 button').innerText = "Obrigado!";
    };

    consultarGemini();
    
});