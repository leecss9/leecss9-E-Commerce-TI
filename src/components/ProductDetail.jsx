import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  db, doc, getDoc, getDocs, collection, addDoc, onSnapshot, query, orderBy, setDoc, updateDoc
} from "../firebase/firebase";
import { useAuth } from '../components/AuthContext';
import { useCart } from '../components/CartContext';
import { getProductImage } from '../components/getProductImage';
import PayPalButton from '../components/PayPalButton';
import "../styles/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { setCartItems } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToKit, setIsAddingToKit] = useState(false);
  const [mostrarPayPal, setMostrarPayPal] = useState(false);

  const clienteId = user?.uid || "cliente-demo";

  // Obtener producto por ID
  useEffect(() => {
    if (!id) return;

    const fetchProductById = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
          setMensaje("");
        } else {
          setProduct(null);
          setMensaje("Producto no encontrado.");
        }
      } catch (error) {
        console.error("Error al cargar producto:", error);
        setMensaje("Error al cargar producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

  // Obtener productos relacionados (máximo 3)
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const related = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id);

        const selected = related.sort(() => 0.5 - Math.random()).slice(0, 3);
        setProductosRelacionados(selected);
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      }
    };

    if (id) fetchRelatedProducts();
  }, [id]);

  // Obtener comentarios en tiempo real
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, `productos/${id}/comentarios`),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComentarios(comments);
    }, (error) => {
      console.error("Error al obtener comentarios:", error);
    });

    return () => unsubscribe();
  }, [id]);

  // Enviar comentario
  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      setMensaje("El comentario no puede estar vacío.");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const nombreUsuario = user?.displayName || "Invitado";

    try {
      await addDoc(collection(db, `productos/${id}/comentarios`), {
        autor: nombreUsuario,
        texto: nuevoComentario.trim(),
        fecha: new Date(),
      });

      setNuevoComentario("");
      setMensaje("Comentario enviado exitosamente!");
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      setMensaje("Error al enviar el comentario.");
    }

    setTimeout(() => setMensaje(""), 3000);
  };

  // Agregar producto al carrito o kit
  const agregarProducto = async (coleccion, productoAgregar, setLoadingFlag, setMensajeFunc) => {
    if (!clienteId || !productoAgregar) return;

    setLoadingFlag(true);
    try {
      const ref = doc(db, coleccion, clienteId);
      const docSnap = await getDoc(ref);

      let productosActuales = docSnap.exists() ? docSnap.data().productos || [] : [];
      const productoExistente = productosActuales.find(p => p.id === productoAgregar.id);

      if (productoExistente) {
        if (coleccion === "carritodecompras") {
          const stockDisponible = productoAgregar.cantidad || 0;
          if (productoExistente.cantidad >= stockDisponible) {
            setMensajeFunc(`Solo hay ${stockDisponible} unidades disponibles.`);
            setLoadingFlag(false);
            return;
          }
        }
        productoExistente.cantidad += 1;
      } else {
        if (coleccion === "carritodecompras" && (productoAgregar.cantidad || 0) <= 0) {
          setMensajeFunc("Este producto está agotado.");
          setLoadingFlag(false);
          return;
        }
        productosActuales.push({ ...productoAgregar, cantidad: 1 });
      }

      if (docSnap.exists()) {
        await updateDoc(ref, { productos: productosActuales });
      } else {
        await setDoc(ref, { productos: productosActuales });
      }

      if (coleccion === "carritodecompras") setCartItems(productosActuales);
      setMensajeFunc(`Producto agregado ${coleccion === "carritodecompras" ? "al carrito" : "al Kit"}!`);
    } catch (error) {
      console.error(`Error al agregar al ${coleccion}:`, error);
      setMensajeFunc(`Error al agregar el producto ${coleccion === "carritodecompras" ? "al carrito" : "al Kit"}.`);
    }
    setLoadingFlag(false);
    setTimeout(() => setMensajeFunc(""), 3000);
  };

  const handleAgregarAlCarrito = (producto) => agregarProducto("carritodecompras", producto, setIsAddingToCart, setMensaje);
  const handleAgregarAlKit = (producto) => agregarProducto("kits", producto, setIsAddingToKit, setMensaje);

  const handleComprarAhora = () => setMostrarPayPal(true);
  const handleCancelarCompra = () => setMostrarPayPal(false);

  if (loading) return <p>Cargando producto...</p>;
  if (!product) return <p>{mensaje || "Producto no encontrado."}</p>;

  return (
    <div className="product-detail-container">
      <aside className="related-products">
        <h3>Productos Recomendados</h3>
        {productosRelacionados.length === 0 ? (
          <p>No hay productos relacionados.</p>
        ) : (
          productosRelacionados.map(rel => (
            <div
              key={rel.id}
              className="related-product-item"
              onClick={() => navigate(`/product/${rel.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${rel.id}`)}
            >
              <img src={getProductImage(rel)} alt={rel.nombre} loading="lazy" />
              <p>{rel.nombre}</p>
            </div>
          ))
        )}
      </aside>

      <main className="product-info">
        <img src={getProductImage(product)} alt={product.nombre} loading="lazy" />
        <h2>{product.nombre}</h2>
        <h3 className="price">
          ${typeof product.precio === "number" ? product.precio.toLocaleString() : "0"}
        </h3>
        <p className="description">{product.descripcion || "Sin descripción detallada."}</p>
        <p><strong>Cantidad en stock:</strong> {product.cantidad || 0}</p>

        <div className="action-buttons">
          <button
            className="btn-carrito"
            onClick={() => handleAgregarAlCarrito(product)}
            disabled={isAddingToCart || product.cantidad <= 0}
            title={product.cantidad <= 0 ? "Producto agotado" : "Agregar al carrito"}
          >
            {isAddingToCart ? "Agregando..." : "Agregar al Carrito"}
          </button>
          <button
            className="btn-kit"
            onClick={() => handleAgregarAlKit(product)}
            disabled={isAddingToKit}
          >
            {isAddingToKit ? "Agregando..." : "Agregar al KIT"}
          </button>

          {mostrarPayPal ? (
            <div className="paypal-container">
              <PayPalButton
                totalAmount={product.precio}
                onSuccess={() => {
                  setMensaje("Compra realizada con éxito");
                  setMostrarPayPal(false);
                }}
                onError={(error) => {
                  console.error("Error en PayPal:", error);
                  setMensaje("Error al procesar la compra.");
                  setMostrarPayPal(false);
                }}
              />
              <button className="btn-cancel" onClick={handleCancelarCompra}>Cancelar</button>
            </div>
          ) : (
            <button
              className="btn-comprar"
              onClick={handleComprarAhora}
              disabled={product.cantidad <= 0}
              title={product.cantidad <= 0 ? "Producto agotado" : "Comprar Ahora"}
            >
              Comprar Ahora
            </button>
          )}
        </div>

        {mensaje && <p className="message">{mensaje}</p>}
      </main>

      <aside className="comments-section">
        <h3>Comentarios</h3>
        <textarea
          placeholder="Enviar Comentarios..."
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          rows={3}
        />
        <button className="btn-comment" onClick={handleEnviarComentario}>Enviar Comentario</button>

        {comentarios.length === 0 ? (
          <p>No hay comentarios todavía.</p>
        ) : (
          comentarios.map((comentario) => (
            <div key={comentario.id} className="comment" tabIndex={0}>
              <p><span className="comment-author">{comentario.autor}</span> - {comentario.texto}</p>
              <p>
                <span className="comment-date">
                  {comentario.fecha?.seconds
                    ? new Date(comentario.fecha.seconds * 1000).toLocaleString()
                    : (comentario.fecha instanceof Date ? comentario.fecha.toLocaleString() : "Fecha inválida")}
                </span>
              </p>
            </div>
          ))
        )}
      </aside>
    </div>
  );
};

export default ProductDetail;
