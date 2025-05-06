import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Productos.css';
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from '../firebase/firebase';

const categorias = [
  "Microcontroladores y placas",
  "Sensores",
  "Actuadores",
  "Componentes Electronicos",
  "Módulos",
  "Cables y conectores",
  "Protoboards y PCB",
  "Alimentación",
  "Herramientas",
  "Kits armados"
];

const Productos = () => {
  const [showForm, setShowForm] = useState(false);
  const [productos, setProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    cantidad: '',
    imagen: '',
    archivoImagen: null
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const navigate = useNavigate();

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingProduct(null);
    }
  };

  const fetchProductos = async () => {
    const productosCollection = collection(db, 'productos');
    const querySnapshot = await getDocs(productosCollection);
    const productosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProductos(productosData);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProductos = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const coincideCategoria = !categoriaSeleccionada || producto.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  const productosMostrados = searchQuery || categoriaSeleccionada
    ? filteredProductos
    : productos.slice(-3).reverse();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        archivoImagen: file,
        imagen: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosProducto = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        imagen: formData.imagen // puede venir de URL o archivo
      };

      if (editingProduct) {
        const productoRef = doc(db, 'productos', editingProduct.id);
        await updateDoc(productoRef, datosProducto);
      } else {
        await addDoc(collection(db, 'productos'), datosProducto);
      }

      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        cantidad: '',
        imagen: '',
        archivoImagen: null
      });
      setShowForm(false);
      setEditingProduct(null);
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio,
      cantidad: producto.cantidad,
      imagen: producto.imagen,
      archivoImagen: null
    });
    setShowForm(true);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Panel de Usuario</h2>
        <p>Administrador</p>
        <nav>
          <button onClick={() => navigate('/')}>Inicio</button>
          <button onClick={() => navigate('/admin')}>Usuarios</button>
          <button onClick={() => navigate('/productos')}>Productos</button>
          <button onClick={() => navigate('/pedidos')}>Pedidos</button>
        </nav>
      </div>

      <div className="main-content">
        <div className="top-buttons">
          <button onClick={toggleForm} className="addButton">
            {showForm ? "Cancelar" : "Agregar Producto"}
          </button>
          <input
            type="text"
            placeholder="Buscar producto..."
            className="searchInput"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th className="tableHeader">Nombre</th>
              <th className="tableHeader">Descripción</th>
              <th className="tableHeader">Categoría</th>
              <th className="tableHeader">Precio</th>
              <th className="tableHeader">Cantidad</th>
              <th className="tableHeader">Imagen</th>
              <th className="tableHeader">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosMostrados.map(producto => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.descripcion}</td>
                <td>{producto.categoria}</td>
                <td>${producto.precio}</td>
                <td>{producto.cantidad}</td>
                <td><img src={producto.imagen} alt={producto.nombre} width="50" /></td>
                <td>
                  <button className="editButton" onClick={() => handleEdit(producto)}>Editar</button>
                  <button className="deleteButton" onClick={() => handleDelete(producto.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showForm && (
          <div className="formContainer">
            <h2>{editingProduct ? "Editar Producto" : "Agregar Producto"}</h2>
            <form className="form" onSubmit={handleSubmit}>
              <input name="nombre" value={formData.nombre} onChange={handleChange} type="text" placeholder="Nombre" className="input" required />
              <input name="descripcion" value={formData.descripcion} onChange={handleChange} type="text" placeholder="Descripción" className="input" required />
              <select name="categoria" value={formData.categoria} onChange={handleChange} className="input" required>
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input name="precio" value={formData.precio} onChange={handleChange} type="number" placeholder="Precio" className="input" required />
              
              <input name="imagen" value={formData.imagen} onChange={handleChange} type="text" placeholder="URL de Imagen (opcional)" className="input" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="input" />

              <input name="cantidad" value={formData.cantidad} onChange={handleChange} type="number" placeholder="Cantidad disponible" className="input" required />
              <div className="form-buttons">
                <button type="submit" className="saveButton">Guardar</button>
                <button type="button" className="cancelButton" onClick={toggleForm}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Productos;

