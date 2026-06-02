// js/index.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Resgata as avaliações do navegador
    let avaliacoes = JSON.parse(localStorage.getItem('vocacaoPlus_avaliacoes'));

    // Se estiver vazio (como na máquina de outro desenvolvedor), injetamos dados de demonstração com IDs estáveis
    if (!avaliacoes || avaliacoes.length === 0) {
        avaliacoes = [
            { id: 1, nome: "Lucas Marcolino Belo", nota: 5, comentario: "Achei o teste incrível! O resultado fez muito sentido com o que eu gosto de fazer. As descrições dos cursos ajudaram bastante a clarear minhas ideias.", liked: false, starred: false },
            { id: 2, nome: "Jonas Costa", nota: 5, comentario: "Muito bom. O gráfico de radar me surpreendeu muito. Sugeriu cursos que eu nem sabia que existiam na UFCA.", liked: true, starred: false },
            { id: 3, nome: "Laiany Sampaio", nota: 4, comentario: "Gostei bastante da plataforma, achei o design muito bonito e fácil de usar. Só o carregamento da IA que demorou uns segundinhos, mas o texto compensou.", liked: false, starred: true }
        ];
        localStorage.setItem('vocacaoPlus_avaliacoes', JSON.stringify(avaliacoes));
    }

    // Elementos da tela
    const elMediaNumero = document.getElementById('media-numero');
    const elMediaEstrelas = document.getElementById('media-estrelas');
    const elTotalAvaliacoes = document.getElementById('total-avaliacoes');
    const elBarrasDistribuicao = document.getElementById('barras-distribuicao');
    const elListaComentarios = document.getElementById('lista-comentarios');

    // 2. Função principal para renderizar a tela toda
    const renderizarTela = () => {
        // Se todas as avaliações forem apagadas pela moderação, exibe um estado vazio amigável
        if (avaliacoes.length === 0) {
            elMediaNumero.innerText = "0,0";
            elTotalAvaliacoes.innerText = "0";
            elMediaEstrelas.innerHTML = '<i class="far fa-star"></i>'.repeat(5);
            elBarrasDistribuicao.innerHTML = '<p class="text-muted small">Nenhuma avaliação.</p>';
            elListaComentarios.innerHTML = '<p class="text-muted text-center py-4">Nenhum comentário enviado ainda.</p>';
            return;
        }

        let somaNotas = 0;
        let distribuicao = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        avaliacoes.forEach(av => {
            somaNotas += av.nota;
            distribuicao[av.nota]++;
        });

        const media = (somaNotas / avaliacoes.length).toFixed(1).replace('.', ',');
        
        elMediaNumero.innerText = media;
        elTotalAvaliacoes.innerText = avaliacoes.length;

        // Estrelas da nota média geral
        let estrelasHTML = '';
        const notaArredondada = Math.round(somaNotas / avaliacoes.length);
        for (let i = 1; i <= 5; i++) {
            if (i <= notaArredondada) estrelasHTML += '<i class="fas fa-star"></i>';
            else estrelasHTML += '<i class="far fa-star"></i>';
        }
        elMediaEstrelas.innerHTML = estrelasHTML;

        // Barras de Progresso
        elBarrasDistribuicao.innerHTML = '';
        for (let i = 5; i >= 1; i--) {
            const porcentagem = ((distribuicao[i] / avaliacoes.length) * 100).toFixed(0);
            
            elBarrasDistribuicao.innerHTML += `
                <div class="d-flex align-items-center mb-2">
                    <span class="text-indigo fw-bold me-2" style="width: 15px;">${i}</span>
                    <div class="progress flex-grow-1" style="height: 8px; background-color: #E8F0FE;">
                        <div class="progress-bar rounded-pill" style="width: ${porcentagem}%; background-color: #1565C0;"></div>
                    </div>
                </div>
            `;
        }

        // 🛡️ MONITOR DE MODERAÇÃO SECRETO
        const modoModerador = sessionStorage.getItem('vp_moderador') === 'true';

        // Lista de Comentários
        elListaComentarios.innerHTML = '';
        avaliacoes.forEach((av, index) => {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += i <= av.nota ? '<i class="fas fa-star text-warning small"></i>' : '<i class="far fa-star text-warning small"></i>';
            }

            // Lógica visual dos botões de interação
            const heartClass = av.liked ? 'fas text-danger' : 'far text-danger opacity-50';
            const starClass = av.starred ? 'fas text-warning' : 'far text-warning opacity-50';

            // Se o modo moderador secreto for ativo, renderiza o botão vermelho de lixeira
            const botaoDeletar = modoModerador 
                ? `<button onclick="deletarComentario(${av.id})" class="btn btn-sm btn-outline-danger border-0 ms-auto hover-scale" title="Apagar comentário ofensivo">
                    <i class="fas fa-trash-alt fs-5"></i>
                   </button>` 
                : "";

            elListaComentarios.innerHTML += `
                <div class="d-flex flex-column mb-3 border-bottom border-light pb-4 position-relative">
                    <div class="d-flex align-items-center mb-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 45px; height: 45px; background-color: #E8F0FE; color: #1565C0; font-weight: bold; font-size: 1.2rem;">
                            ${av.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h5 class="fw-bold text-indigo mb-0">${av.nome}</h5>
                            <div>${stars}</div>
                        </div>
                        ${botaoDeletar}
                    </div>
                    <p class="text-muted" style="line-height: 1.6; padding-left: 60px;">${av.comentario}</p>
                    <div class="d-flex gap-3 mt-2" style="padding-left: 60px; font-size: 1.2rem;">
                        <i class="${heartClass} cursor-pointer hover-scale transition" onclick="toggleInteracao(${index}, 'like')" title="Curtir"></i>
                        <i class="${starClass} cursor-pointer hover-scale transition" onclick="toggleInteracao(${index}, 'star')" title="Destacar"></i>
                    </div>
                </div>
            `;
        });
    };

    // 3. Funções para interagir com os botões (Global para o HTML conseguir chamar)
    window.toggleInteracao = (index, tipo) => {
        if (tipo === 'like') {
            avaliacoes[index].liked = !avaliacoes[index].liked;
        } else if (tipo === 'star') {
            avaliacoes[index].starred = !avaliacoes[index].starred;
        }

        localStorage.setItem('vocacaoPlus_avaliacoes', JSON.stringify(avaliacoes));
        renderizarTela();
    };

    // 🛡️ FUNÇÃO DE EXCLUSÃO DE COMENTÁRIO MAL-INTENCIONADO
    window.deletarComentario = (id) => {
        if (confirm("Líder, deseja realmente remover permanentemente esta avaliação do sistema?")) {
            // Filtra removendo o ID selecionado
            avaliacoes = avaliacoes.filter(av => av.id !== id);
            localStorage.setItem('vocacaoPlus_avaliacoes', JSON.stringify(avaliacoes));
            renderizarTela(); // Recalcula médias e atualiza a tela instantaneamente
        }
    };

    // 🔑 COMANDOS DO CONSOLE PARA GERENCIAMENTO DA EQUIPE
    window.ativarModeracao = () => {
        sessionStorage.setItem('vp_moderador', 'true');
        renderizarTela();
        console.log("🔒 Modo de segurança ativado! Ferramentas de exclusão liberadas na tela.");
    };

    window.desativarModeracao = () => {
        sessionStorage.removeItem('vp_moderador');
        renderizarTela();
        console.log("🔓 Modo de segurança desativado.");
    };

    // Inicializa a tela pela primeira vez
    renderizarTela();

});

// ==========================================================================
// IMPLEMENTAÇÃO DO EASTER EGG (12 CLIQUES - VÍDEO LOCAL)
// ==========================================================================
const navbarBrand = document.querySelector(".navbar-brand");
const easterModalElement = document.getElementById('easterEggModal');
const localVideo = document.getElementById('videoEasterEgg');

let cliqueContador = 0;
let cliqueTimeout;

if (navbarBrand && easterModalElement && localVideo) {
    const easterModal = new bootstrap.Modal(easterModalElement);

    navbarBrand.addEventListener("click", (e) => {
        e.preventDefault();
        cliqueContador++;

        clearTimeout(cliqueTimeout);
        cliqueTimeout = setTimeout(() => {
            cliqueContador = 0;
        }, 3000);

        if (cliqueContador === 12) {
            cliqueContador = 0; 
            
            localVideo.load(); 
            localVideo.currentTime = 0;
            
            easterModal.show();
            
            localVideo.play().catch(error => {
                console.log("Autoplay bloqueado pelo navegador:", error);
            });
        }
    });

    easterModalElement.addEventListener('hidden.bs.modal', () => {
        localVideo.pause();
    });
}