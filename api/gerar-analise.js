// api/gerar-analise.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ erro: 'Método não permitido' });
    }

    try {
        const promptParaIA = request.body.prompt;
        
        // Puxa a chave do cofre da Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        
        // Verificação de segurança: A chave realmente existe no cofre?
        if (!apiKey) {
            throw new Error("A Vercel não encontrou a variável GEMINI_API_KEY. Verifique as configurações (Environment Variables).");
        }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const respostaGoogle = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptParaIA }] }] })
        });

        if (!respostaGoogle.ok) {
            const erroDetalhado = await respostaGoogle.text();
            throw new Error(`O Google recusou a conexão. Motivo: ${erroDetalhado}`);
        }

        const dadosAPI = await respostaGoogle.json();
        
        if (!dadosAPI.candidates || dadosAPI.candidates.length === 0) {
            throw new Error("O Google não devolveu nenhum texto válido.");
        }

        let respostaTexto = dadosAPI.candidates[0].content.parts[0].text;
        
        // Limpa a formatação Markdown (```json) se a IA enviar
        respostaTexto = respostaTexto.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const resultadoFinal = JSON.parse(respostaTexto);

        return response.status(200).json(resultadoFinal);

    } catch (erro) {
        console.error("🕵️ ERRO NO BACK-END:", erro.message);
        // O Raio-X: Agora enviamos o erro EXATO para o Front-end ler
        return response.status(500).json({ 
            erro: 'Falha ao processar.', 
            detalhe: erro.message 
        });
    }
}