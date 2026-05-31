
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import productsData from "../admin/teste.json";
import "./produtos.css";


export default function Produtos() {
    const location = useLocation();
    const params = useParams();
    const [produto, setProduto] = useState(location.state?.product || null);
    const [imagemSelecionada, setImagemSelecionada] = useState(null);
    const [precoSelecionado, setPrecoSelecionado] = useState(null);
    const [corEscolhida, setCorEscolhida] = useState(null);
    const [tamanhoEscolhido, setTamanhoEscolhido] = useState(null);
    const [acabamentoTipo, setAcabamentoTipo] = useState('natural');

    useEffect(() => {
        if (!produto && params.id) {
            const found = productsData.find(p => String(p.id) === params.id);
            setProduto(found || null);
        }
        console.log("Produto encontrado:", produto);
    }, [params.id]);

    // Inicializa com o primeiro tamanho selecionado
    useEffect(() => {
        if (produto && produto.variantes && produto.variantes.length > 0) {
            const dimensoes = [
                ...new Set(
                    produto.variantes.map(v => v.tamanho || (v.dimensoes ? `${v.dimensoes.altura}x${v.dimensoes.largura}` : null)).filter(Boolean)
                )
            ];
            
            if (dimensoes.length > 0 && !tamanhoEscolhido) {
                const primeiroTamanho = dimensoes[0];
                setTamanhoEscolhido(primeiroTamanho);
                
                // Define o preço do primeiro tamanho
                const variant = produto.variantes.find(v => 
                    (v.tamanho || (v.dimensoes ? `${v.dimensoes.altura}x${v.dimensoes.largura}` : null)) === primeiroTamanho
                );
                if (variant) {
                    setPrecoSelecionado(variant.preco);
                }
            }
        }
    }, [produto]);

    if (!produto) {
        return (
            <div>
                <h1>Produto não encontrado</h1>
            </div>
        );
    }

    const generalImages = (() => {
        const raw = produto.imagem_geral;
        if (Array.isArray(raw)) return raw.filter(Boolean).map(img => img.url).filter(Boolean);
        if (raw?.url) return [raw.url];
        return [];
    })();

    const colorImages = produto.imagens_por_cor?.flatMap(item =>
        item.imagens?.filter(Boolean).map(img => img.url) || []
    ) || [];

    const variantImages = produto.variantes?.flatMap(v => {
        const urls = [];
        if (v.imagem?.url) urls.push(v.imagem.url);
        if (Array.isArray(v.imagens)) urls.push(...v.imagens.filter(Boolean).map(img => img.url));
        return urls;
    }) || [];

    const variationImages = [...new Set([...generalImages, ...colorImages, ...variantImages])].filter(Boolean);

    const imagemPrincipal = variationImages[0] || produto.imagem_geral?.url || "";

    // Preço: usa o preço selecionado por cor/tamanho ou o menor preço disponível
    const precoExibido = (() => {
        if (precoSelecionado) return precoSelecionado;

        // tenta corresponder cor + tamanho
        if ((corEscolhida || tamanhoEscolhido) && produto.variantes && produto.variantes.length > 0) {
            const matchBoth = produto.variantes.find(v => {
                const cor = v.cor || v.acabamento || null;
                const tamanho = v.tamanho || (v.dimensoes ? `${v.dimensoes.altura}x${v.dimensoes.largura}` : null);
                return (corEscolhida ? cor === corEscolhida : true) && (tamanhoEscolhido ? tamanho === tamanhoEscolhido : true);
            });
            if (matchBoth) return matchBoth.preco;
        }

        if (produto.variantes && produto.variantes.length > 0) {
            const prices = produto.variantes
                .map(v => Number(v.preco || 0))
                .filter(p => !isNaN(p) && p > 0);
            if (prices.length) return Math.min(...prices);
        }
        return "0.00";
    })();

    const acabamentos = [
    ...new Set(
        produto.variantes.map(v => v.cor || v.acabamento).filter(Boolean)
    )
    ];

    const dimensoes = [
    ...new Set(
        produto.variantes.map(v => v.tamanho || (v.dimensoes ? `${v.dimensoes.altura}x${v.dimensoes.largura}` : null)).filter(Boolean)
    )
    ];

    return (
        <div className="edit-container-produto">
            <div className="central-container-produto">
                <div className="produtos-variacoes">
                    {variationImages.map((url, index) => (
                        <li
                            onClick={() => setImagemSelecionada(url)}
                            key={`${url}-${index}`}
                            style={{ marginBottom: 12 }}
                        >
                            <img src={url} alt={`${produto.titulo_geral}-${index}`} style={{ width: '100%' }} />
                        </li>
                    ))}
                </div>
                <div className="imagem-principal">
                    {(imagemSelecionada || imagemPrincipal) && (
                        <img src={imagemSelecionada || imagemPrincipal} alt={produto.titulo_geral} style={{maxWidth:300}} />
                    )}

                    
                </div>
                
                <div className="produtos-descricao">
                    <div>
                        <h1>{produto.titulo_geral}</h1>
                        <div className="preco-container">
                            <span className="preco-label">Preço:</span>
                            <p className="preco-valor">R$ {precoExibido}</p>
                        </div>

                        <div className="variacao-container">
                            <p className="variacao-titulo">Acabamento:</p>
                            <div className="acabamento-tipo-container">
                                <button
                                    className={`btn-tipo ${acabamentoTipo === 'natural' ? 'selecionado' : ''}`}
                                    onClick={() => {
                                        setAcabamentoTipo('natural');
                                        // se natural, limpa a cor escolhida (não aplica pintura)
                                        setCorEscolhida(null);
                                        setPrecoSelecionado(null);
                                    }}
                                >
                                    Natural
                                </button>
                                <button
                                    className={`btn-tipo ${acabamentoTipo === 'pintado' ? 'selecionado' : ''}`}
                                    onClick={() => {
                                        setAcabamentoTipo('pintado');
                                        // ao mudar para pintado, não alteramos automaticamente a cor
                                        setCorEscolhida(null);
                                        setPrecoSelecionado(null);
                                    }}
                                >
                                    Pintado
                                </button>
                            </div>

                            {acabamentoTipo === 'pintado' && (
                                <div style={{marginTop:8}}>
                                    <label style={{fontSize:13, color:'#555', marginRight:8}}>Selecione a cor:</label>
                                    <select
                                        value={corEscolhida || ''}
                                        onChange={e => {
                                            const c = e.target.value || null;
                                            setCorEscolhida(c);
                                            const variant = produto.variantes.find(v => (v.cor || v.acabamento) === c && (!tamanhoEscolhido || (v.tamanho || (v.dimensoes ? `${v.dimensoes.altura}x${v.dimensoes.largura}` : null)) === tamanhoEscolhido));
                                            setPrecoSelecionado(variant?.preco || null);
                                        }}
                                    >
                                        <option value="">-- Escolha --</option>
                                        {acabamentos
                                            .filter(c => (c || '').toLowerCase() !== 'natural')
                                            .map((c, i) => (
                                                <option key={i} value={c}>{c}</option>
                                            ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="variacao-container">
                            <p className="variacao-titulo">Tamanho:</p>
                            <div className="botoes-variacao">
                                {dimensoes.map((d, index) => (
                                    <button
                                        key={index}
                                        className={`btn-variacao ${tamanhoEscolhido === d ? 'selecionado' : ''}`}
                                        onClick={() => {
                                            setTamanhoEscolhido(d);
                                            const variant = produto.variantes.find(v => (v.tamanho || (v.dimensoes ? `${v.dimensoes.altura}x${v.dimensoes.largura}` : null)) === d && (!corEscolhida || (v.cor || v.acabamento) === corEscolhida));
                                            setPrecoSelecionado(variant?.preco || null);
                                        }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
                    
            </div>
        </div>
    )
}