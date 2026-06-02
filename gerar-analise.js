// api/gerar-analise.js
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ erro: 'Método não permitido' });
    }

    try {
        const promptParaIA = request.body.prompt;
        
        // Puxa a chave do cofre secreto interno da Vercel (Variável de Ambiente)
        const apiKey = process.env.GEMINI_API_KEY;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const respostaGoogle = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptParaIA }] }] })
        });

        if (!respostaGoogle.ok) {
            const erroDetalhado = await respostaGoogle.text();
            throw new Error(`Google recusou: ${erroDetalhado}`);
        }

        const dadosAPI = await respostaGoogle.json();
        let respostaTexto = dadosAPI.candidates[0].content.parts[0].text;
        
        respostaTexto = respostaTexto.replace(/```json/g, "").replace(/```/g, "").trim();
        const resultadoFinal = JSON.parse(respostaTexto);

        return response.status(200).json(resultadoFinal);

    } catch (erro) {
        console.error("🕵️ ERRO NO BACK-END:", erro);
        return response.status(500).json({ erro: 'Falha ao processar.' });
    }
}