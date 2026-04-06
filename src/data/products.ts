export interface ProductVariant {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  ingredients: string;
  presentation: string;
  image: string;
  price: number;
  category: string;
  variants?: ProductVariant[];
  is_featured?: boolean;
  badge_text?: string;
  featured_order?: number;
}

export const products: Product[] = [
  {
    id: "flexanil-ultra-forte",
    name: "Flexanil Ultra Forte",
    tagline: "Salud articular y ósea",
    description: "Fórmula nutracéutica y eficaz contra los dolores, molestias articulares y óseas causadas por enfermedades degenerativas del cartílago. Elimina la inflamación, la hinchazón y el dolor, restaura la movilidad articular y permite la regeneración del cartílago.",
    benefits: [
      "Indicado para tratar la artrosis, artritis, reuma y descalcificación.",
      "Fortalece las articulaciones, huesos, ligamentos, músculos y tendones.",
      "Fortalece y mejora la salud de los tendones.",
      "Reduce la inflamación y ayuda a absorber adecuadamente el calcio."
    ],
    ingredients: "Mezcla en polvo instantáneo con graviola, colágeno hidrolizado, vitaminas y minerales.",
    presentation: "Doypack de 30 sachets / 10 g.",
    image: "https://images.unsplash.com/photo-1611078813354-150247071661?auto=format&fit=crop&q=80&w=800",
    price: 89.90,
    category: "Suplementos",
    is_featured: true,
    badge_text: "Más Vendido",
    featured_order: 1,
    variants: [
      { name: "Unidad", price: 89.90 },
      { name: "Pack x2", price: 160.00 }
    ]
  },
  {
    id: "fortisol-fit",
    name: "Fortisol Fit",
    tagline: "Termogénico y energía",
    description: "Es un suplemento termogénico diseñado para apoyar la quema de grasa, mejorar el rendimiento físico y aumentar los niveles de energía. Su fórmula avanzada favorece el metabolismo, ayudando a alcanzar objetivos de pérdida de peso de manera más eficiente.",
    benefits: [
      "Estimulante del apetito, regula el apetito y favorece a la pérdida de peso.",
      "Favorece el tránsito intestinal haciendo un Sistema Digestivo más saludable."
    ],
    ingredients: "Mezcla instantánea en polvo de moringa, espirulina, té verde, chía, ciruela y piña.",
    presentation: "Doypack de 30 sachets / 5 g.",
    image: "https://images.unsplash.com/photo-1556040220-4096d522378d?auto=format&fit=crop&q=80&w=800",
    price: 79.90,
    category: "Control de Peso",
    is_featured: true,
    badge_text: "Top Ventas",
    featured_order: 2,
    variants: [
      { name: "Unidad", price: 79.90 },
      { name: "Pack x2", price: 140.00 }
    ]
  },
  {
    id: "bio-alcalin",
    name: "Bio Alcalin",
    tagline: "Equilibrio y bienestar",
    description: "Es una formulación esencial para el cuerpo humano, involucrado en más de 300 reacciones bioquímicas. Juega un papel crucial en la salud muscular, nerviosa y ósea, además de ayudar a reducir el estrés y mejorar el sueño.",
    benefits: [
      "Regula el transito intestinal.",
      "Desintoxica el organismo.",
      "Favorece el sueño y reduce el estrés.",
      "Regula el azúcar en la sangre.",
      "Protege la salud cardiovascular.",
      "Mejora la función cerebral."
    ],
    ingredients: "Mezcla de polvo de camu camu, magnesio y vitamina C.",
    presentation: "Frasco de 20 sachets / 5 g.",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800",
    price: 69.90,
    category: "Suplementos",
    is_featured: true,
    badge_text: "Más Pedido",
    featured_order: 3,
    variants: [
      { name: "Unidad", price: 69.90 },
      { name: "Pack x2", price: 120.00 }
    ]
  },
  {
    id: "gast-tryn-herbal",
    name: "Gast-tryn Herbal Maxxx",
    tagline: "Salud digestiva",
    description: "Es una fórmula nutracéutica que contribuye al bienestar general de los problemas gástricos y a la eliminación de bacterias que afectan a la digestión.",
    benefits: [
      "Contribuye a fortalecer las paredes del estómago.",
      "Ideal para el tratamiento de la gastritis estomacal.",
      "Reduce el malestar y la acidez estomacal.",
      "Elimina Bacterias que afectan al estómago."
    ],
    ingredients: "Mezcla en polvo para preparar bebida de tocosh y sábila con probióticos.",
    presentation: "Doypack de 30 sachets / 5 g.",
    image: "https://images.unsplash.com/photo-1596547609652-9cb5d8d737bf?auto=format&fit=crop&q=80&w=800",
    price: 75.00,
    category: "Salud Digestiva",
    variants: [
      { name: "Unidad", price: 75.00 },
      { name: "Pack x2", price: 130.00 }
    ]
  },
  {
    id: "aceite-copaiba",
    name: "Aceite de Copaiba",
    tagline: "Antiinflamatorio natural",
    description: "Para todos los tipos de dolor y desorden inflamatorios como, artritis, reumatismo, ciática; malestar y úlceras estomacales, fuegos labiales, acné, cicatrices y picaduras de insectos.",
    benefits: [
      "Inflamación, dolores de espalda o ciática.",
      "Reduce la inflamación del cuerpo.",
      "Aplica unas cuantas gotas y utiliza una toalla tibia sobre articulaciones inflamadas y adoloridas.",
      "Combina 2-3 gotas con una cucharada de miel y toma para el dolor de garganta.",
      "Aplica directamente en la piel para acné, cicatrices y estrías."
    ],
    ingredients: "Copaifera Officinali",
    presentation: "Frasco con gotero de 25ml",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
    price: 45.00,
    category: "Aceites Esenciales",
    variants: [
      { name: "Unidad", price: 45.00 },
      { name: "Pack x2", price: 80.00 }
    ]
  },
  {
    id: "aceite-molle",
    name: "Aceite Esencial de Molle",
    tagline: "Alivio muscular",
    description: "El bálsamo de molle es una planta medicinal con diversas propiedades curativas. Se ha utilizado tradicionalmente para tratar dolores musculares y articulares, inflamación, infecciones y problemas respiratorios.",
    benefits: [
      "Alivia dolores musculares.",
      "Articulares.",
      "Reumatismo.",
      "Relajante muscular: Alivia la tensión muscular y los calambres.",
      "Golpes y torceduras.",
      "Lesiones deportivas."
    ],
    ingredients: "Schinus molle",
    presentation: "Envase / 200 ml.",
    image: "https://images.unsplash.com/photo-1626705051054-65f57322d713?auto=format&fit=crop&q=80&w=800",
    price: 55.00,
    category: "Aceites Esenciales",
    variants: [
      { name: "Unidad", price: 55.00 },
      { name: "Pack x2", price: 100.00 }
    ]
  }
];
