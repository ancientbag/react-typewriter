import { useEffect, useRef, useState, useCallback } from "react";
import { totalCharCount, delayForChar, locateChar } from "./smartTypewriter";
import type { TSentence } from "./smartTypewriter";

export type { TSentence };

export interface IUseSmartTypewriterOptions {
    sentences: TSentence[];
    sentenceDelay?: number;
    autoStart?: boolean;
    onFinish?: () => void;
}

export interface IUseSmartTypewriterPayload<
    T extends HTMLElement = HTMLElement,
> {
    ref: React.RefObject<T | null>;
    start: () => void;
    restart: () => void;
    pause: () => void;
    resume: () => void;
    isFinished: boolean;
}

export function useSmartTypewriter<T extends HTMLElement = HTMLElement>(
    options: IUseSmartTypewriterOptions,
): IUseSmartTypewriterPayload<T> {
    const {
        sentences,
        sentenceDelay = 300,
        autoStart = true,
        onFinish,
    } = options;
    const ref = useRef<T>(null);
    const rafIdRef = useRef(0);
    const lastTimeRef = useRef(0);
    const charIndexRef = useRef(0);
    const displayedRef = useRef("");
    const tickRef = useRef<((ts: number) => void) | null>(null);
    const isRunningRef = useRef(false);
    const isPausedRef = useRef(false);
    const [isFinished, setIsFinished] = useState(false);

    const optionsRef = useRef({ sentences, sentenceDelay, onFinish });
    optionsRef.current = { sentences, sentenceDelay, onFinish };

    const start = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        cancelAnimationFrame(rafIdRef.current);

        const { sentences: currentSentences, sentenceDelay: currentDelay } =
            optionsRef.current;
        const totalChars = totalCharCount(currentSentences);
        if (totalChars === 0) {
            isRunningRef.current = false;
            setIsFinished(true);
            return;
        }

        charIndexRef.current = 0;
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
                elapsed >=
                    delayForChar(
                        currentSentences,
                        charIndexRef.current,
                        currentDelay,
                    ) &&
                charIndexRef.current < totalChars
            ) {
                const loc = locateChar(currentSentences, charIndexRef.current);
                displayedRef.current += loc.sentence.text[loc.localIndex];
                el.textContent = displayedRef.current;
                charIndexRef.current += 1;
                lastTimeRef.current = timestamp;
            }

            if (charIndexRef.current < totalChars) {
                rafIdRef.current = requestAnimationFrame(tick);
            } else {
                isRunningRef.current = false;
                setIsFinished(true);
                optionsRef.current.onFinish?.();
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
