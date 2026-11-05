# Questions

Created to learn some questions to pass the exam. The application use [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to save progress and questions in your browser. This app also support [PWA](https://developers.google.com/web/progressive-web-apps/), so it is possible to install it on mobile devices form your browser.

You can try on:
[questions.adamzielonka.pro](https://adam-zielonka.github.io/questions/)

## File Format
You need json file similar to this:
``` json
[
  {
    "question": "Answer for this question is: ",
    "answers": [
      {
        "correct": true,
        "value": "This is true"
      },
      {
        "correct": true,
        "value": "This is false"
      },
      {
        "correct": false,
        "value": "This is also false"
      },
      {
        "correct": true,
        "value": "This is true, too"
      }
    ]
  }
]
```

|property  |value                       |
|----------|----------------------------|
|file      |`[{question, answers}]`     |
|`question`|`String`, accepted HTML code|
|`answers` |`[{correct, value}]`        |
|`correct` |Boolean(`true` or `false`)  |
|`value`   |`String`, accepted `\n`     |

You can find example file in this link:
[question file](./src/assets/questions.json)

The bundled demo uses this same file: 50 lighthearted English questions about
space, animals, technology and everyday absurdities. Some questions have more
than one correct answer. Choose **Open quiz → Load demo quiz** to try the full set.
The same menu also offers **Load from URL** (a direct HTTP/HTTPS link to a JSON
or TXT quiz; the server must allow cross-origin requests) and **Load from file**.
Replacing an existing quiz requires confirmation. Failed imports keep the current
quiz and progress.

## Technologies

- [JS](https://developer.mozilla.org/pl/docs/Web/JavaScript)
- [React](https://reactjs.org/)
- [Mobx](https://mobx.js.org/) & [Mobx React Lite](https://mobx-react.js.org/)

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for the current runtime, builds and checks.
