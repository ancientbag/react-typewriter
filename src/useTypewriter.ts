import { useEffect, useRef, useState, useCallback } from "react";

export interface IUseTypewriterOptions {
    delay?: number;
    autoStart?: boolean;
}

export interface IUseTypewriterPayload<T extends HTMLElement = HTMLElement> {
    ref: React.RefObject<T | null>;
    start: () => void;
    restart: () => void;
    pause: () => void;
    resume: () => void;
    isFinished: boolean;
}

export function useTypewriter<T extends HTMLElement = HTMLElement>(
    text: string,
    options: IUseTypewriterOptions = {},
): IUseTypewriterPayload<T> {
    const { delay = 100, autoStart = true } = options;
    const ref = useRef<T>(null);
    const indexRef = useRef(0);
    const rafIdRef = useRef(0);
    const lastTimeRef = useRef(0);
    const displayedRef = useRef("");
    const tickRef = useRef<((ts: number) => void) | null>(null);
    const isRunningRef = useRef(false);
    const isPausedRef = useRef(false);
    const [isFinished, setIsFinished] = useState(false);

    const textRef = useRef(text);
    textRef.current = text;
    const delayRef = useRef(delay);
    delayRef.current = delay;

    const start = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        cancelAnimationFrame(rafIdRef.current);

        const currentText = textRef.current;
        if (currentText.length === 0) {
            isRunningRef.current = false;
            setIsFinished(true);
            return;
        }

        indexRef.current = 0;
        lastTimeRef.current = 0;
        displayedRef.current = "";
        el.textContent = "";
        isPausedRef.current = false;
        isRunningRef.current = true;
        setIsFinished(false);

        const tick = (timestamp: number) => {
            if (!isRunningRef.current) return;

            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const elapsed = timestamp - lastTimeRef.current;

            if (
                elapsed >= delayRef.current &&
                indexRef.current < currentText.length
            ) {
                displayedRef.current += currentText[indexRef.current];
                el.textContent = displayedRef.current;
                indexRef.current += 1;
                lastTimeRef.current = timestamp;
            }

            if (indexRef.current < currentText.length) {
                rafIdRef.current = requestAnimationFrame(tick);
            } else {
                isRunningRef.current = false;
                setIsFinished(true);
            }
        };

        tickRef.current = tick;
        rafIdRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (autoStart) start();
        return () => {
            isRunningRef.current = false;
            cancelAnimationFrame(rafIdRef.current);
        };
    }, [start, autoStart]);

    const restart = useCallback(() => {
        cancelAnimationFrame(rafIdRef.current);
        isRunningRef.current = false;
        start();
    }, [start]);

    const pause = useCallback(() => {
        if (!isRunningRef.current) return;
        isPausedRef.current = true;
        cancelAnimationFrame(rafIdRef.current);
    }, []);

    const resume = useCallback(() => {
        if (!isRunningRef.current || !isPausedRef.current) return;
        isPausedRef.current = false;
        lastTimeRef.current = 0;
        if (tickRef.current) {
            rafIdRef.current = requestAnimationFrame(tickRef.current);
        }
    }, []);

    return { ref, start, restart, pause, resume, isFinished };
}
