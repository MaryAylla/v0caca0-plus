const fs = require('fs');
const path = require('path');

// Configuração dos caminhos
const csvDirectory = './assets/data/temp_csv';
const outputFile = './assets/data/cursos.json';

// Função para gerar um ID amigável e único
const generateId = (nome, faculdade) => {
    if (!nome) return Math.random().toString(36).substring(2, 9); // Prevenção de erro caso a linha esteja vazia
    return `${nome}-${faculdade}`.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const converter = () => {
    const files = fs.readdirSync(csvDirectory);
    let allCourses = [];

    files.forEach(file => {
        if (path.extname(file) === '.csv') {
            const universityName = path.basename(file, '.csv').toUpperCase();
            const data = fs.readFileSync(path.join(csvDirectory, file), 'utf8');
            
            // Quebra o arquivo em linhas e remove a primeira (o cabeçalho)
            const lines = data.split('\n').slice(1);

            lines.forEach(line => {
                if (line.trim() === '') return;

                // TRUQUE DE SÊNIOR: Expressão Regular para lidar com vírgulas dentro do texto
                const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());

                // Mapeamento exato das suas 14 colunas
                const cursoObj = {
                    id: generateId(columns[0], universityName),
                    instituicao: universityName,
                    nome: columns[0] || "",             // 0: CURSO
                    duracao: columns[1] || "",          // 1: DURAÇÃO
                    notaCorte: columns[2] || "",        // 2: NOTA DE CORTE
                    formaIngresso: columns[3] || "",    // 3: FORMA DE INGRESSO
                    tipo: columns[4] || "",             // 4: TIPO
                    numeroVagas: columns[5] || "",      // 5: NUMERO DE VAGAS
                    areaAtuacao: columns[6] || "",      // 6: AREA DE ATUAÇÃO
                    mediaSalarial: columns[7] || "",    // 7: MED. SALARIAL
                    mediaFormandos: columns[8] || "",   // 8: MED. FORMANDOS POR SEMESTRE
                    campus: columns[9] || "",           // 9: CAMPUS
                    turno: columns[10] || "",           // 10: TURNO
                    modalidade: columns[11] || "",      // 11: MODALIDADE
                    descricao: columns[12] || "",       // 12: DESCRIÇÃO
                    linkCurso: columns[13] || "",        // 13: LINK DO CURSO
                    eixo: columns[14] || ""
                };

                allCourses.push(cursoObj);
            });
        }
    });

    // Salva o arquivo JSON final
    fs.writeFileSync(outputFile, JSON.stringify(allCourses, null, 2));
    console.log(`✅ Sucesso! ${allCourses.length} cursos processados e salvos no banco estático.`);
};

converter();