import React, { useEffect, useState } from "react";
import "./adminpage.css";

export default function AdminPage() {
  const [titulo, setTitulo] = useState("");
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState("");

  /* ========================================= DADOS ESCOLHIDOS =========================================*/

  const [categorias, setCategorias] = useState([]);
  const [cores, setCores] = useState([]);
  const [desenhos, setDesenhos] = useState([]);

  /*========================================= INPUTS NOVOS =========================================*/

  const [categoriaInput, setCategoriaInput] = useState("");

  const [corInput, setCorInput] = useState("");

  const [desenhoInput, setDesenhoInput] = useState("");

  /* ========================================= OPÇÕES VINDAS DO BANCO ========================================= */

  const [availableCategorias, setAvailableCategorias,] = useState([]);

  const [availableCores, setAvailableCores] = useState([]);

  const [availableDesenhos, setAvailableDesenhos,] = useState([]);

  /* ========================================= PREÇOS =========================================*/

  const [preco, setPreco] = useState({
    natural: [
      {
        height: "",
        width: "",
        price: "",
      },
    ],

    pintado: [
      {
        height: "",
        width: "",
        price: "",
      },
    ],
  });

  /* ========================================= LOAD FORMS ========================================= */

  useEffect(() => {
    async function loadForms() {
        try {
            const res = await fetch(
            "http://localhost:3000/forms"
            );

            const data = await res.json();
            const form = data[0];

            setAvailableCategorias(form.categorias || []);

            setAvailableCores(form.cores || []);

            setAvailableDesenhos(form.desenhos || []);

        } catch (err) {
            console.log(err);
        }
    }

    loadForms();
  }, []);

  /* ========================================= ADD OPTION DATABASE =========================================*/

  async function saveOption(body) {
    await fetch(
        "http://localhost:3000/forms/options",
        {
            method: "POST",
            headers: {
            "Content-Type":
                "application/json",
            },
            body: JSON.stringify(body),
        }
    );
  }

  /* ========================================= TAGS ========================================= */

  function removeItem( index, list, setter) {
    setter(list.filter((_, i) => i !== index));
  }

  /* ========================================= VARIAÇÕES ========================================= */

  function addVariation(type) {
    setPreco((prev) => ({
        ...prev,
        [type]: [
            ...prev[type],
            {
            height: "",
            width: "",
            price: "",
            },
         ],
    }));
  }

  function removeVariation(type, index) {
    setPreco((prev) => {
        const updated = { ...prev };

        updated[type] =
            updated[type].filter(
            (_, i) => i !== index
            );

        if (
            updated[type].length === 0
        ) {
            updated[type].push({
            height: "",
            width: "",
            price: "",
            });
        }

        return updated;
    });
  }

  function updateVariation(type, index, field, value) {
    setPreco((prev) => {
        const updated = { ...prev };
        updated[type][index][field] =
            value;

        return updated;
    });
  }

  /* ========================================= UPLOAD AWS ========================================= */

  async function uploadImages() {
    const formData = new FormData();

    files.forEach((file) => {formData.append("images", file);});

    const res = await fetch(
        "http://localhost:3000/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await res.json();
    return data.images;
  }

  /* ========================================= VALIDATE ========================================= */

  function validate() {
    if (!titulo.trim()) {
        return "Título obrigatório";
    }

    if (categorias.length === 0) {
        return "Escolha uma categoria";
    }

    if (files.length === 0) {
        return "Adicione imagens";
    }

    for (const type of [
        "natural",
        "pintado",
    ]) {
        for (const item of preco[type]) {
            if (!item.height || !item.width || !item.price) {
                return `Preencha todos os preços ${type}`;
            }
        }
    }

    return null;
  }

  /* ========================================= SUBMIT ========================================= */

    async function handleSubmit() {
        const error = validate();

        if (error) {
            setErrors(error);
            return;
        }

        setErrors("");

        try {
        /* ======================== upload imagens ======================== */

        const uploadedImages =
            await uploadImages();

        /* ======================== produto final ======================== */

        const produto = {
            titulo,
            categoria: categorias,
            preco: [
            {
                natural:
                preco.natural,

                pintado:
                preco.pintado,
            },
            ],

            cor: cores,
            desenho: desenhos,
            imagens: uploadedImages,
        };

        console.log(produto);

        /* ======================== salvar produto ========================*/

        await fetch(
            "http://localhost:3000/products",
            {
            method: "POST",
            headers: {
                "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
                produto
            ),
            }
        );

        alert("Produto salvo com sucesso!");

        } catch (err) {
            console.log(err);

            setErrors("Erro ao salvar produto");
        }
    }

  /* ========================================= JSX ========================================= */

  return (
    <div className="admin-card-container">
      <div className="admin-card">
        {/* ================= ERRO ================= */}
        {errors && (
          <div className="admin-error-box">
            {errors}
          </div>
        )}

        {/* ================= TÍTULO ================= */}
        <input
          placeholder="Título do produto"
          value={titulo}
          onChange={(e) =>
            setTitulo(
              e.target.value
            )
          }
        />

        {/* ===================================== */}
        {/* CATEGORIAS */}
        {/* ===================================== */}

        <div className="admin-section">

            <h3>Categorias</h3>

            <select
                onChange={(e) => {
                    if (!e.target.value)
                        return;

                    if (categorias.includes(e.target.value))
                        return;

                    setCategorias([
                        ...categorias,
                        e.target.value,
                    ]);
                }}
            >
                <option value="">
                    Escolha categoria
                </option>

                {availableCategorias.map(
                    (item, index) => (
                        <option key={index}value={item}>
                        {item}
                        </option>
                    )
                )}
            </select>

            <div className="admin-tag-input">
                <input
                    placeholder="Nova categoria"
                    value={
                        categoriaInput
                    }
                    onChange={(e) =>
                        setCategoriaInput(
                        e.target.value
                        )
                    }
                />

                <button
                    onClick={async () => {
                        if (!categoriaInput.trim())
                            return;

                        if (categorias.includes(categoriaInput))
                            return;

                        setCategorias([
                            ...categorias,
                            categoriaInput,
                        ]);

                        setAvailableCategorias(
                            [
                                ...availableCategorias,
                                categoriaInput,
                            ]
                        );

                        await saveOption({
                            categoria:
                                categoriaInput,
                        });

                        setCategoriaInput("");
                    }}
                >
                 +
                </button>

            </div>

            <div className="admin-tags">

                {categorias.map(
                (item, index) => (
                    <div className="admin-tag" key={index}>
                        {item}

                        <button
                            onClick={() =>
                            removeItem(
                                index,
                                categorias,
                                setCategorias
                            )
                            }
                        >
                            ✕
                        </button>
                    </div>
                )
                )}

            </div>

        </div>

        {/* ===================================== */}
        {/* CORES */}
        {/* ===================================== */}

        <div className="admin-section">

            <h3>Cores</h3>

            <select
                onChange={(e) => {
                if (!e.target.value)
                    return;

                if (cores.includes(e.target.value))
                    return;

                setCores([
                    ...cores,
                    e.target.value,
                    ]);
                }}
            >
                <option value="">
                    Escolha cor
                </option>

                {availableCores.map(
                (item, index) => (
                    <option key={index} value={item}>
                        {item}
                    </option>
                )
                )}
            </select>

            <div className="admin-tag-input">

                <input
                    placeholder="Nova cor"
                    value={corInput}
                    onChange={(e) =>
                        setCorInput(
                        e.target.value
                        )
                    }
                />

                <button
                    onClick={async () => {
                        if (!corInput.trim())
                            return;

                        setCores([
                            ...cores,
                            corInput,
                        ]);

                        setAvailableCores([
                            ...availableCores,
                            corInput,
                        ]);

                        await saveOption({cor: corInput,});

                        setCorInput("");
                    }}
                >
                    +
                </button>

            </div>

            <div className="admin-tags">

                {cores.map(
                (item, index) => (
                    <div className="admin-tag" key={index}>
                        {item}

                    <button
                        onClick={() =>
                        removeItem(
                            index,
                            cores,
                            setCores
                        )
                        }
                    >
                        ✕
                    </button>
                    </div>
                )
                )}

            </div>

        </div>

        {/* ===================================== */}
        {/* DESENHOS */}
        {/* ===================================== */}

        <div className="admin-section">
          <h3>Desenhos</h3>

            <select
                onChange={(e) => {
                    if (!e.target.value)
                        return;

                    if (desenhos.includes(e.target.value))
                        return;

                    setDesenhos([
                        ...desenhos,
                        e.target.value,
                    ]);
                }}
            >
                <option value="">
                    Escolha desenho
                </option>

                {availableDesenhos.map(
                (item, index) => (
                    <option key={index} value={item}>
                        {item}
                    </option>
                )
                )}
            </select>

            <div className="admin-tag-input">
                <input
                    placeholder="Novo desenho"
                    value={
                        desenhoInput
                    }
                    onChange={(e) =>
                        setDesenhoInput(
                        e.target.value
                        )
                    }
                />

                <button
                    onClick={async () => {
                        if (!desenhoInput.trim() )
                            return;

                        setDesenhos([
                            ...desenhos,
                            desenhoInput,
                        ]);

                        setAvailableDesenhos(
                            [
                                ...availableDesenhos,
                                desenhoInput,
                            ]
                        );

                        await saveOption({
                            desenho:
                                desenhoInput,
                            });

                            setDesenhoInput(
                            ""
                        );
                    }}
                >
                    +
                </button>

            </div>

            <div className="admin-tags">

                {desenhos.map(
                (item, index) => (
                    <div
                        className="admin-tag"
                        key={index}
                    >
                        {item}

                        <button
                            onClick={() =>
                                removeItem(
                                    index,
                                    desenhos,
                                    setDesenhos
                                )
                            }
                        >
                            ✕
                        </button>
                    </div>
                )
                )}

            </div>

        </div>

        {/* ===================================== */}
        {/* IMAGENS */}
        {/* ===================================== */}

        <div className="admin-section">

            <h3>Imagens</h3>

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                setFiles(
                    Array.from(
                    e.target.files
                    )
                )
                }
            />

            <div className="admin-image-preview">

                {files.map(
                    (file, index) => (
                        <div className="admin-img-box" key={index} >

                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                            />

                            <button
                                onClick={() =>
                                    setFiles( files.filter( ( _, i) => i !== index))
                                }
                            >
                                ✕
                            </button>
                        </div>
                    )
                )}

            </div>

        </div>

        {/* ===================================== */}
        {/* NATURAL */}
        {/* ===================================== */}

        <div className="admin-section">

            <h3>Natural</h3>

            {preco.natural.map(
                (item, index) => (
                <div className="admin-variation" key={index}>
                    <input
                        placeholder="Altura"
                        value={
                            item.height
                        }
                        onChange={(e) =>
                            updateVariation(
                            "natural",
                            index,
                            "height",
                            e.target.value
                            )
                        }
                    />

                    <input
                        placeholder="Largura"
                        value={
                            item.width
                        }
                        onChange={(e) =>
                            updateVariation(
                            "natural",
                            index,
                            "width",
                            e.target.value
                            )
                        }
                    />

                    <input
                        placeholder="Preço"
                        value={
                            item.price
                        }
                        onChange={(e) =>
                            updateVariation(
                            "natural",
                            index,
                            "price",
                            e.target.value
                            )
                        }
                    />

                    <button
                        onClick={() =>
                            removeVariation(
                            "natural",
                            index
                            )
                        }
                    >
                    🗑
                    </button>
                </div>
                )
            )}

            <button
                onClick={() =>
                addVariation(
                    "natural"
                )
                }
            >
                + Natural
            </button>

        </div>

        {/* ===================================== */}
        {/* PINTADO */}
        {/* ===================================== */}

        <div className="admin-section">

            <h3>Pintado</h3>

            {preco.pintado.map(
                (item, index) => (
                <div className="admin-variation" key={index}>
                    <input
                        placeholder="Altura"
                        value={
                            item.height
                        }
                        onChange={(e) =>
                            updateVariation(
                            "pintado",
                            index,
                            "height",
                            e.target.value
                            )
                        }
                    />

                    <input
                        placeholder="Largura"
                        value={
                            item.width
                        }
                        onChange={(e) =>
                            updateVariation(
                            "pintado",
                            index,
                            "width",
                            e.target.value
                            )
                        }
                    />

                    <input
                        placeholder="Preço"
                        value={
                            item.price
                        }
                        onChange={(e) =>
                            updateVariation(
                            "pintado",
                            index,
                            "price",
                            e.target.value
                            )
                        }
                    />

                    <button
                        onClick={() =>
                            removeVariation(
                            "pintado",
                            index
                            )
                        }
                    >
                        🗑
                    </button>
                </div>
                )
            )}

            <button
                onClick={() =>
                    addVariation(
                        "pintado"
                    )
                }
            >
                + Pintado
            </button>

        </div>

        {/* ===================================== */}
        {/* SALVAR */}
        {/* ===================================== */}

        <button
            className="admin-save-btn"
            onClick={handleSubmit}
        >
            Salvar Produto
        </button>

      </div>
    </div>
  );
}
