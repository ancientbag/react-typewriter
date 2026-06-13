# react-typewriter

React hooks for typewriter text animation effects.

## Install

```bash
npm install react-typewriter
```

## `useTypewriter`

Animates a single string.

```tsx
import { useTypewriter } from "react-typewriter";

function App() {
    const { ref, isFinished } = useTypewriter("Hello, world!", {
        delay: 100,
        autoStart: true,
    });

    return <h1 ref={ref} />;
}
```

**Options**

| Option      | Type      | Default | Description              |
| ----------- | --------- | ------- | ------------------------ |
| `delay`     | `number`  | `100`   | ms between each char     |
| `autoStart` | `boolean` | `true`  | start animating on mount |

**Returns**

| Field        | Type                      | Description                          |
| ------------ | ------------------------- | ------------------------------------ |
| `ref`        | `RefObject<T>`            | attach to any HTML element           |
| `start`      | `() => void`              | start typing from the beginning      |
| `restart`    | `() => void`              | cancel and restart typing            |
| `pause`      | `() => void`              | pause typing                         |
| `resume`     | `() => void`              | resume typing after pause            |
| `isFinished` | `boolean`                 | `true` when animation completes      |

## `useSmartTypewriter`

Animates multiple sentences with per-sentence and per-letter delays.

```tsx
import { useSmartTypewriter } from "react-typewriter";

function App() {
    const { ref } = useSmartTypewriter({
        sentences: [
            { text: "Hello!", delay: 80 },
            { text: "How are you?", delayByLetter: { " ": 300 } },
        ],
        sentenceDelay: 500,
    });

    return <h1 ref={ref} />;
}
```

**Options**

| Option          | Type         | Default | Description                              |
| --------------- | ------------ | ------- | ---------------------------------------- |
| `sentences`     | `TSentence[]`| —       | sentences to type (required)             |
| `sentenceDelay` | `number`     | `300`   | ms delay before starting a new sentence  |
| `autoStart`     | `boolean`    | `true`  | start animating on mount                 |
| `onFinish`      | `() => void` | —       | called when all sentences finish typing  |

**Sentence object**

| Field            | Type                     | Description                       |
| ---------------- | ------------------------ | --------------------------------- |
| `text`           | `string`                 | the sentence to type              |
| `delay?`         | `number`                 | ms between chars (default `100`)  |
| `delayByLetter?` | `Record<string, number>` | override delay for specific chars |

**Returns**

| Field        | Type                      | Description                          |
| ------------ | ------------------------- | ------------------------------------ |
| `ref`        | `RefObject<T>`            | attach to any HTML element           |
| `start`      | `() => void`              | start typing from the beginning      |
| `restart`    | `() => void`              | cancel and restart typing            |
| `pause`      | `() => void`              | pause typing                         |
| `resume`     | `() => void`              | resume typing after pause            |
| `isFinished` | `boolean`                 | `true` when animation completes      |

## License

MIT
