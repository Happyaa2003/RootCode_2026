import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
  style?: React.CSSProperties;
  cursorColor?: string;
  onComplete?: () => void;
  loop?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  words,
  typingSpeed = 50,
  deletingSpeed = 25,
  pauseTime = 2500,
  className = '',
  style,
  cursorColor = '#2563EB',
  onComplete,
  loop = true,
}) => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const fullWord = words[currentWordIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && currentText === fullWord) {
      if (!loop && currentWordIdx === words.length - 1) {
        onComplete?.();
        return;
      }
      timer = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIdx((prev) => (prev + 1) % words.length);
    } else {
      const nextCharLength = isDeleting ? currentText.length - 1 : currentText.length + 1;
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timer = setTimeout(() => {
        setCurrentText(fullWord.substring(0, nextCharLength));
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIdx, words, typingSpeed, deletingSpeed, pauseTime, loop, onComplete]);

  return (
    <span className={`waypoint-typewriter ${className}`} style={{ ...style, display: 'inline' }}>
      <span>{currentText}</span>
      <span
        style={{
          display: 'inline-block',
          marginLeft: '2px',
          width: '2px',
          height: '1em',
          verticalAlign: 'middle',
          backgroundColor: cursorColor,
          animation: 'typewriterBlink 0.9s infinite',
        }}
      />
    </span>
  );
};

export default TypewriterText;
