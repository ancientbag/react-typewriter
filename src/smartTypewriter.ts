export interface TSentence {
    text: string;
    delay?: number;
    delayByLetter?: Record<string, number>;
}

export type TSentenceLocation = {
    sentence: TSentence;
    localIndex: number;
    sentenceIndex: number;
    isAtSentenceStart: boolean;
};

export function locateChar(
    sentences: TSentence[],
    globalIndex: number,
): TSentenceLocation {
    let offset = 0;
    for (let i = 0; i < sentences.length; i++) {
        const len = sentences[i].text.length;
        if (globalIndex < offset + len) {
            return {
                sentence: sentences[i],
                localIndex: globalIndex - offset,
                sentenceIndex: i,
                isAtSentenceStart: globalIndex === offset,
            };
        }
        offset += len;
    }
    const last = sentences.length - 1;
    return {
        sentence: sentences[last],
        localIndex: 0,
        sentenceIndex: last,
        isAtSentenceStart: false,
    };
}

export function totalCharCount(sentences: TSentence[]): number {
    return sentences.reduce((sum, s) => sum + s.text.length, 0);
}

export function delayForChar(
    sentences: TSentence[],
    globalIndex: number,
    sentenceDelay: number,
): number {
    const loc = locateChar(sentences, globalIndex);
    if (loc.isAtSentenceStart && loc.sentenceIndex > 0) return sentenceDelay;

    const ch = loc.sentence.text[loc.localIndex];
    if (loc.sentence.delayByLetter && ch in loc.sentence.delayByLetter) {
        return loc.sentence.delayByLetter[ch];
    }
    if (loc.sentence.delay !== undefined) return loc.sentence.delay;
    return 100;
}
