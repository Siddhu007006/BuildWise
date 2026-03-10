"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TypewriterEffectProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
    cursorWidth?: number;
    cursorHeight?: string;
    cursorColor?: string;
}

export function TypewriterEffect({
    words,
    typingSpeed = 80,
    deletingSpeed = 50,
    pauseDuration = 2000,
    className = "",
    cursorWidth = 3,
    cursorHeight = "1.1em",
    cursorColor = "hsl(var(--primary))",
}: TypewriterEffectProps) {
    const [displayText, setDisplayText] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [inView, setInView] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                } else {
                    setInView(false);
                    // Reset to start from the beginning when scrolled out of view
                    setDisplayText("");
                    setWordIndex(0);
                    setIsDeleting(false);
                    setIsPaused(false);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const tick = useCallback(() => {
        const currentWord = words[wordIndex];

        if (isPaused) return;

        if (!isDeleting) {
            // Typing
            if (displayText.length < currentWord.length) {
                setDisplayText(currentWord.slice(0, displayText.length + 1));
            } else {
                // Finished typing — pause before deleting
                setIsPaused(true);
                setTimeout(() => {
                    setIsPaused(false);
                    setIsDeleting(true);
                }, pauseDuration);
            }
        } else {
            // Deleting
            if (displayText.length > 0) {
                setDisplayText(currentWord.slice(0, displayText.length - 1));
            } else {
                // Finished deleting — move to next word
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % words.length);
            }
        }
    }, [displayText, wordIndex, isDeleting, isPaused, words, pauseDuration]);

    useEffect(() => {
        if (!inView) return;

        const speed = isDeleting ? deletingSpeed : typingSpeed;
        const timer = setTimeout(tick, speed);
        return () => clearTimeout(timer);
    }, [tick, inView, isDeleting, deletingSpeed, typingSpeed]);

    return (
        <span ref={containerRef} className={`inline-flex items-center ${className}`}>
            <span>{displayText}</span>
            <span
                className="inline-block animate-blink ml-[2px] rounded-sm"
                style={{
                    width: `${cursorWidth}px`,
                    height: cursorHeight,
                    backgroundColor: cursorColor,
                }}
            />
        </span>
    );
}
