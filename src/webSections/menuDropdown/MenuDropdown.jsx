import React, { useMemo, useState, useEffect, useRef } from 'react';
import './menuDropdown.css';
import headerImg1 from '../../assets/img/header_img_1.png';
import headerImg2 from '../../assets/img/header_img_2.png';
import headerImg3 from '../../assets/img/header_img_3.png';
import headerImg4 from '../../assets/img/header_img_4.png';

// Hardcoded demo data by menu type
const DEMO_MENUS = {
  desayuno: {
    title: 'Nuestro Café',
    categories: [
      {
        id: 'cafes',
        name: 'Cafés de especialidad',
        items: [
          { id: 'capuccino', name: 'Capuccino', price: '$2.800', desc: 'Doble espresso con leche vaporizada y espuma sedosa.', img: headerImg1 },
          { id: 'flat-white', name: 'Flat White', price: '$3.000', desc: 'Doble ristretto con leche cremosa, balance intenso.', img: headerImg2 },
          { id: 'cold-brew', name: 'Cold Brew', price: '$3.200', desc: 'Extracción en frío 12 hs, notas florales y cacao.', img: headerImg3 },
        ],
      },
      {
        id: 'dulces',
        name: 'Dulces y Pastelería',
        items: [
          { id: 'medialunas', name: 'Medialunas de manteca', price: '$1.200', desc: 'Horneadas cada mañana. Opción con jamón y queso.', img: headerImg4 },
          { id: 'budin', name: 'Budín de limón', price: '$1.700', desc: 'Glaseado cítrico, húmedo y aromático.', img: headerImg2 },
        ],
      },
      {
        id: 'tostadas',
        name: 'Tostadas y Bowls',
        items: [
          { id: 'avotoast', name: 'Avo Toast', price: '$3.600', desc: 'Pan de masa madre, palta, huevo poché y semillas.', img: headerImg1 },
          { id: 'granola', name: 'Granola bowl', price: '$3.200', desc: 'Yogur natural, granola casera, miel y frutas.', img: headerImg3 },
        ],
      },
    ],
  },
  almuerzo: {
    title: 'Almuerzo/Cena',
    categories: [
      {
        id: 'tapeo',
        name: 'Tapeo',
        items: [
          { id: 'papas-groove', name: 'Papas Groove', price: '$11.500', desc: 'Papas sazonadas estilo de la casa.', img: headerImg1 },
          { id: 'papas-bravas', name: 'Papas Bravas', price: '$11.200', desc: 'Con salsa brava casera.', img: headerImg2 },
          { id: 'papas-americanas', name: 'Papas Americanas', price: '$11.500', desc: 'Cheddar y carne salseada.', img: headerImg3 },
          { id: 'rabas', name: 'Rabas a la Romana', price: '$15.900', desc: 'Con alioli de la casa.', img: headerImg4 },
          { id: 'emp-osobuco', name: 'Empanadas de Osobuco', price: '$9.700', desc: 'Braseado y salsa criolla.', img: headerImg2 },
          { id: 'emp-pollo', name: 'Empanadas de pollo al horno', price: '$9.100', desc: 'Con verdeo y salsa criolla.', img: headerImg1 },
          { id: 'pollo-crunch', name: 'Pollo Crunch con barbacoa', price: '$9.900', desc: 'Bocados crocantes con salsa BBQ.', img: headerImg3 },
          { id: 'baston-muzza', name: 'Bastoncitos de Muzzarella', price: '$9.500', desc: 'Con ketchup.', img: headerImg4 },
        ],
      },
      {
        id: 'ensaladas',
        name: 'Ensaladas',
        items: [
          { id: 'groove-bowl', name: 'Groove Bowl', price: '$12.900', desc: 'Mix verde, pollo crispy o veggie, panceta, croutons y aderezo.', img: headerImg1 },
          { id: 'caesar', name: 'César', price: '$12.600', desc: 'Lechuga romana, parmesano, croutons y aderezo clásico.', img: headerImg2 },
        ],
      },
      {
        id: 'picadas',
        name: 'Picadas',
        items: [
          { id: 'cervecera', name: 'Cervecera', price: '$23.900', desc: 'Empanadas de carne, Pollo Crunch, bastones de muzza, papas, jamón, queso, salame y tostadas.', img: headerImg3 },
          { id: 'groove', name: 'Groove', price: '$30.900', desc: 'Jamón crudo, queso dambo, queso azul, jamón natural, tomate, queso sardo fresco, aceitunas y vegetales.', img: headerImg4 },
        ],
      },
      {
        id: 'pizzas',
        name: 'Pizzas',
        items: [
          { id: 'mediterranea', name: 'Mediterránea', price: '$15.500', desc: 'Ricota fresca, jamón serrano, tomates asados y rúcula.', img: headerImg1 },
          { id: 'campestre', name: 'Campestre', price: '$15.800', desc: 'Vegetales asados, queso y salsa de la casa.', img: headerImg2 },
          { id: 'mexicana', name: 'A la Mexicana', price: '$16.500', desc: 'Ternera braseada desmenuzada, cheddar y verdeo (opción picante).', img: headerImg3 },
          { id: 'napolitana', name: 'Napolitana', price: '$15.000', desc: 'Tomate, ajo, mozzarella y albahaca.', img: headerImg4 },
          { id: 'pepperoni-verdeo', name: 'Pepperoni y Verdeo', price: '$15.500', desc: 'Pepperoni ahumado, mozzarella y verdeo.', img: headerImg2 },
          { id: 'especial', name: 'Especial', price: '$15.500', desc: 'Jamón natural y morrones asados.', img: headerImg1 },
        ],
      },
      {
        id: 'burgers',
        name: 'Burgers (todas con papas)',
        items: [
          { id: 'yankee', name: 'Yankee', price: '$14.900', desc: '2 medallones de ternera, cheddar, panceta, barbacoa y cebolla caramelizada.', img: headerImg3 },
          { id: 'veggie', name: 'Veggie', price: '$14.900', desc: 'Medallón de garbanzos, vegetales salteados, lechuga y tomate.', img: headerImg4 },
          { id: 'argento', name: 'Argento', price: '$19.900', desc: '2 medallones de ternera, tomate, queso y salsa criolla.', img: headerImg2 },
        ],
      },
      {
        id: 'especiales',
        name: 'Especiales de nuestra cheff',
        items: [
          { id: 'bondiola-cerveza', name: 'Bondiola a la Cerveza', price: '$17.600', desc: 'Con puré de batatas/batata chips (agridulce).', img: headerImg1 },
          { id: 'matambre-napo', name: 'Matambre Napolitano', price: '$13.600', desc: 'Con salsa fileto y ensalada.', img: headerImg2 },
          { id: 'osobuco-malbec', name: 'Osobuco Braseado al malbec', price: '$17.600', desc: 'Con puré de papas y verduras.', img: headerImg3 },
          { id: 'pollo-disco', name: 'Pollo al disco', price: '$12.600', desc: 'Con su salsa, con brocoli y papas españolas.', img: headerImg4 },
        ],
      },
      {
        id: 'pastas',
        name: 'Pastas',
        items: [
          { id: 'malfatis', name: 'Malfatis de papa rellenos de muzzarella', price: '$14.500', desc: 'Suaves y caseros.', img: headerImg2 },
          { id: 'gnocchi-espinaca', name: 'Ñoquis de Espinaca y Papa', price: '$14.900', desc: 'Clásicos italianos.', img: headerImg1 },
          { id: 'sorrentinos-jamon', name: 'Sorrentinos de jamón y muzzarella', price: '$15.500', desc: 'Relleno tradicional.', img: headerImg3 },
          { id: 'sorrentinos-verdura', name: 'Sorrentinos de verdura', price: '$15.900', desc: 'Relleno de vegetales.', img: headerImg4 },
          { id: 'sorrentinos-ternera', name: 'Sorrentinos de ternera al Malbec', price: '$15.500', desc: 'Sabor intenso al vino tinto.', img: headerImg2 },
        ],
      },
      {
        id: 'salsas',
        name: 'Salsas',
        items: [
          { id: 'bechamel', name: 'Bechamel', price: '$1.500', desc: 'Salsa blanca cremosa.', img: headerImg1 },
          { id: 'filetto', name: 'Filetto', price: '$1.500', desc: 'Tomate y hierbas.', img: headerImg2 },
          { id: 'bolognesa', name: 'Bolognesa', price: '$1.800', desc: 'Clásica de carne.', img: headerImg3 },
          { id: 'cuatro-quesos', name: 'Cuatro quesos', price: '$2.000', desc: 'Blend de quesos.', img: headerImg4 },
        ],
      },
    ],
  },
  bebidas: {
    title: 'Cócteles',
    categories: [
      {
        id: 'clasicos',
        name: 'Clásicos',
        items: [
          { id: 'branca', name: 'Branca', price: '$4.900', desc: 'Fernet Branca con Coca Cola.', img: headerImg1 },
          { id: 'gancia-batido', name: 'Gancia Batido', price: '$4.500', desc: 'Gancia, jugo de limón, almíbar, soda.', img: headerImg2 },
          { id: 'cuba-libre', name: 'Cuba Libre', price: '$4.500', desc: 'Ron, Coca Cola, rodaja de limón.', img: headerImg3 },
          { id: 'campari', name: 'Campari', price: '$4.500', desc: 'Con exprimido de naranjas.', img: headerImg4 },
          { id: 'campari-tonic', name: 'Campari Tonic', price: '$4.500', desc: 'Con agua tónica.', img: headerImg1 },
          { id: 'aperol', name: 'Aperol', price: '$4.500', desc: 'Espumante, soda, dash de exprimido de naranjas.', img: headerImg2 },
          { id: 'cosmopolitan', name: 'Cosmopolitan', price: '$5.500', desc: 'Martini, jugo de arándanos, limón, vodka.', img: headerImg3 },
        ],
      },
      {
        id: 'gin-collections',
        name: 'Gin Collections',
        items: [
          { id: 'blue-gin', name: 'Blue Gin', price: '$5.800', desc: 'Gin infusionado con Santa Quina y pepino.', img: headerImg4 },
          { id: 'river-juice', name: 'River Juice', price: '$5.800', desc: 'Gin infusionado, dash de bitter, tónica Santa Quina, rodaja de naranja.', img: headerImg1 },
          { id: 'morrison', name: 'Morrison', price: '$5.800', desc: 'Bombay Berry, tónica Santa Quina, pomelo, rodaja de pomelo y frutos rojos.', img: headerImg2 },
          { id: 'groove', name: 'Groove', price: '$5.800', desc: 'Apostoles Gin Rosa Mosqueta, tónica Pulpo Blanco, frambuesas, lima y limón.', img: headerImg3 },
          { id: 'spring', name: 'Spring', price: '$5.800', desc: 'Bombay, tónica Pulpo Blanco, frutas.', img: headerImg4 },
          { id: 'passion', name: 'Passion', price: '$5.800', desc: 'Beefeater, tónica Schweppes, maracuyá, rodaja de naranja.', img: headerImg1 },
        ],
      },
      {
        id: 'aperitivos-vermucitos',
        name: 'Aperitivos & Vermucitos',
        items: [
          { id: 'cynar-julep', name: 'Cynar Julep', price: '$7.000', desc: 'Cynar al 70, pomelo, syrup, menta.', img: headerImg2 },
          { id: 'jager-julep', name: 'Jager Julep', price: '$7.000', desc: 'Jägermeister, pomelo, syrup, menta.', img: headerImg3 },
          { id: 'mate-negroni', name: 'Mate Negroni', price: '$5.000', desc: 'Apostoles Gin Mate, Campari, Vermú rosso.', img: headerImg4 },
          { id: 'manhattan-porteno', name: 'Manhattan Porteño', price: '$5.000', desc: 'Carpano Vermú, Jean Beam, Angostura.', img: headerImg1 },
          { id: 'carpano-orange', name: 'Carpano Orange', price: '$5.000', desc: 'Carpano rosso, soda, dash de naranja.', img: headerImg2 },
          { id: 'ferroviario', name: 'Ferroviario', price: '$5.000', desc: 'Fernet Branca, Cinzano rosso, soda, rodaja de limón.', img: headerImg3 },
          { id: 'torino', name: 'Torino', price: '$5.000', desc: 'Campari Punt E Mes rosso, rodaja de naranja.', img: headerImg4 },
        ],
      },
    ],
  },
};

const Category = ({ cat, open, onToggle }) => {
  return (
    <div className={`md-cat ${open ? 'open' : ''}`}>
      <button className="md-cat-header" onClick={() => onToggle(cat.id)} aria-expanded={open}>
        <span className="md-cat-name">{cat.name}</span>
        <span className="md-cat-arrow" aria-hidden>▾</span>
      </button>
      <div className="md-cat-panel" style={{ maxHeight: open ? `${cat.items.length * 128 + 24}px` : 0 }}>
        <ul className="md-items">
          {cat.items.map(item => (
            <li key={item.id} className="md-item">
              <div className="md-item-media">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="md-item-body">
                <div className="md-item-row">
                  <h4 className="md-item-name">{item.name}</h4>
                  <span className="md-item-price">{item.price}</span>
                </div>
                <p className="md-item-desc">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const MenuDropdown = ({ menuType }) => {
  const sectionRef = useRef(null);
  const data = useMemo(() => DEMO_MENUS[menuType] ?? null, [menuType]);
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => {
    setOpenCat(null);
  }, [menuType]);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  if (!data) return null;

  const toggle = (id) => setOpenCat(prev => (prev === id ? null : id));

  return (
    <section ref={sectionRef} id="menu-dropdown" className="menu-dropdown">
      <div className="md-container">
        <h2 className="md-title">{data.title}</h2>
        <div className="md-list">
          {data.categories.map(cat => (
            <Category key={cat.id} cat={cat} open={openCat === cat.id} onToggle={toggle} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuDropdown;
