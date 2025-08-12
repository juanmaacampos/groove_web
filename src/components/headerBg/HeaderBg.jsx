import React, { useState, useEffect } from 'react';
import img1 from '../../assets/img/header_img_1.png';
import img2 from '../../assets/img/header_img_2.png';
import img3 from '../../assets/img/header_img_3.png';
import img4 from '../../assets/img/header_img_4.png';
import './headerBg.css';

// Simple decorative blurred background using the 4 images layered.
export const HeaderBg = () => {
  const images = [img1, img2, img3, img4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="header-bg" aria-hidden="true">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt=""
          className={`bg-layer ${index === currentImageIndex ? 'active' : ''}`}
        />
      ))}
      <div className="bg-overlay" />
    </div>
  );
};

export default HeaderBg;
