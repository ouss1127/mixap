# Projet

C'est un projet `React` avec `Typescript`.

# Installation du projet

Intall `node and npm` first (better install nvm)

1. Install Yarn
2. `cd mixap`
3. `yarn install`

To use AR in the development mode, we need to start the projet using HTTS.

If you are using _Microsoft Windows_, use:

- `set HTTPS=true&&yarn start`

If you are using _Mac os or Linux_, use:

- `HTTPS=true yarn start`

# Commandes

Voilà les commandes pour démarrer, compiler, déployer, formatter, et linter le projet:

```
// file: package.json

"start": "HTTPS=true craco start", // démarre le projet en mode dev
"build": "craco build", // build le projet en mode production
"deploy": "surge build", // déploie le dossier `build` sur surge
"test": "react-scripts test",
"eject": "react-scripts eject",
"format": "prettier --write \"**/*.{js,ts,tsx}\"", // format le projet selon la notre configuration `prettier`
"lint": "eslint \"**/*.{js,ts,tsx}\"", // affiche des erreurs de typage, style, etc.
```

# Packages Utilisés

Voilà la liste des packages importants qu'on utilise dans le projet :

- Interface : [Ant Design](https://ant.design/components/overview/)
- State Manager : [Zustand](https://github.com/pmndrs/zustand). Install **redux devtools** to visualize the state with console.
- 3D / Canvas : [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- AR - Marker detection : [Mind-ar-js](https://hiukim.github.io/mind-ar-js-doc/quick-start/overview/)
- Interaction / gesture : [React / Three Use-gesture](https://use-gesture.netlify.app/)
- Animation : [React / Three Spring](https://react-spring.dev/)
- Recording (e.g., audio, canvas) : [RecordRTC](https://github.com/muaz-khan/RecordRTC)
