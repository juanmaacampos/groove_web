import React, { useEffect, useState } from 'react';
import './typewriter.css';

/**
 * Typewriter component
 * - Renders a static prefix and a typing/deleting word that cycles through a list
 * Props:
 *  - prefix: string shown before the animated word (default: "Nuestros")
 *  - words: array of words to cycle (default: platos, cocteles, cafés, desayunos, meriendas, cenas, tragos)
 *  - typingSpeed: ms per character when typing
 *  - deleteSpeed: ms per character when deleting
 *  - pauseTime: ms to wait after word completes before deleting
 *  - loop: whether to loop through words forever (default: true)
 *  - className: optional extra class names
 */
const Typewriter = ({
  prefix = 'Nuestros',
  words = ['cocteles', 'cafés', 'desayunos', 'meriendas', 'cenas', 'tragos', 'brunchs'],
  typingSpeed = 90,
  deleteSpeed = 55,
  pauseTime = 1200,
  loop = true,
  className = '',
}) => {
  const [index, setIndex] = useState(0); // current word index
  const [subIndex, setSubIndex] = useState(0); // current char index within word
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  // Typing/deleting effect
  useEffect(() => {
    if (!words.length) return undefined;

    const current = words[index];

    // If finished typing the word, pause then start deleting
    if (!deleting && subIndex === current.length) {
      const timeout = setTimeout(() => setDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    // If finished deleting the word, move to next
    if (deleting && subIndex === 0) {
      const nextIndex = (index + 1) % words.length;
      if (!loop && nextIndex === 0) return undefined; // stop
      setDeleting(false);
      setIndex(nextIndex);
      return undefined;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? deleteSpeed : typingSpeed);
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, words, typingSpeed, deleteSpeed, pauseTime, loop]);

  // Caret blink
  useEffect(() => {
    const timeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  const currentWord = words.length ? words[index] : '';

  return (
    <span className={`tw-wrapper ${className}`}>
      {prefix ? <span className="tw-prefix">{prefix}</span> : null}
      {prefix ? ' ' : null}
      <span
        className="tw-typing"
        aria-live="polite"
        aria-label={`${prefix} ${currentWord}`}
      >
        <span className="tw-text">{currentWord.substring(0, subIndex)}</span>
        <span className={`tw-caret${blink ? ' visible' : ''}`} aria-hidden="true" />
      </span>
    </span>
  );
};

export default Typewriter;
