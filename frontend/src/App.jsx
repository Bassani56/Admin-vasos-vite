import React, { Suspense, lazy, useEffect, useState } from "react";

import AdminPage from "./pages/admin/AdminPage.jsx";
import EditPage from "./pages/admin/EditPage.jsx";
import { Routes, Route } from "react-router-dom";
import Produtos from "./pages/produtos/Produtos.jsx";

function App() {

  return (
    <>
        {/* <AdminPage/> */}
        <Routes>
          <Route path="/" element={ <AdminPage/> }/>
          <Route path="/produtos/:id" element={ <Produtos/> }/>
          <Route path="/edit" element={ <EditPage/> }/>
          <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
        </Routes>
    </>
  )
}

export default App
