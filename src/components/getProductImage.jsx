const placeholderImage = "https://via.placeholder.com/150?text=Sin+Imagen";

export const getProductImage = (producto) =>
  producto?.imageUrl || producto?.imagen || placeholderImage;
