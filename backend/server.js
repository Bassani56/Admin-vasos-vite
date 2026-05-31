require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const fs = require("fs")
const path = require("path")

const Forms = require('./models/InputForm')

const app = express()
app.use(express.json())
app.use(cors())


const multer = require("multer");

const {
  uploadImage,
  deleteImage,
} = require("./s3");

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files;

    const uploadedImages = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;

      await uploadImage(
        file.buffer,
        fileName,
        file.mimetype
      );

      const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      uploadedImages.push({
        fileName,
        url,
      });
    }

    res.json({
      success: true,
      images: uploadedImages,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro upload múltiplo",
    });
  }
});

app.delete("/image/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const result = await deleteImage(name);

    res.json(result);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro ao deletar imagem",
    });
  }
});

app.listen(3000, () => {
  console.log("Server rodando");
});


app.get('/forms', async (req, res) => {
    try {
        const forms = await Forms.find()
        res.json(forms)
    } catch (error) {
        console.error(error)
        res.status(500).json({erro: error.message})
    }  
})


app.post("/forms/options", async (req, res) => {
  try {
    const {
      categoria,
      cor,
      desenho,
    } = req.body;

    const form = await Forms.findOne();

    /*
    =========================
    CATEGORIA
    =========================
    */

    if (
      categoria &&
      !form.categorias.includes(categoria)
    ) {
      form.categorias.push(categoria);
    }

    /*
    =========================
    COR
    =========================
    */

    if (
      cor &&
      !form.cores.includes(cor)
    ) {
      form.cores.push(cor);
    }

    /*
    =========================
    DESENHO
    =========================
    */

    if (
      desenho &&
      !form.desenhos.includes(desenho)
    ) {
      form.desenhos.push(desenho);
    }

    await form.save();

    res.json({
      success: true,
      form,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      erro: error.message,
    });
  }
});


const Produto = require('./models/Produto')

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find()
        res.json(produtos)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({erro: error.message})
    }
})

app.get('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findOne({ $or: [{ _id: id }, { id: Number(id) }] });
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const produtoData = req.body;

    const created = await Produto.create(produtoData);

    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Produto.findOneAndUpdate(
      { $or: [{ _id: id }, { id: Number(id) }] },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: error.message || 'Erro ao atualizar produto',
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : []
    });
    res.status(500).json({ erro: error.message });
  }
});


mongoose.connect(process.env.MONGO_URI, {
    dbName: 'meu_banco'
})
