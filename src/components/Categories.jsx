import "../styles/categorias.css";

const Categories = ({ onCategorySelect }) => {
  const categories = [
    "Microcontroladores y placas",
    "Sensores",
    "Actuadores",
    "Componentes Electronicos",
    "Módulos",
    "Cables y conectores",
    "Protoboards y PCB",
    "Alimentación",
    "Herramientas",
    "Kits armados",
  ];

  return (
    <div className="categories">
      {categories.map((category) => (
        <a
          key={category}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (typeof onCategorySelect === "function") {
              onCategorySelect(category); // ✅ Llamamos solo si es función
            } else {
              console.warn("onCategorySelect no está definido o no es una función");
            }
          }}
        >
          {category}
        </a>
      ))}
    </div>
  );
};

export default Categories;
