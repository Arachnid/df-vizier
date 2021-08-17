# 🪐 Welcome Aspiring DF Plug-in Developers!

This repo should be a good starting point for anyone looking to build out there own Dark Forest Plugins or Scripts.

This project is setup to use the [plugin dev server](https://github.com/projectsophon/df-plugin-dev-server) so that you can use you're local IDE and has interfaces for the core ui and df object ready-to-roll.

To get started run:

`$ yarn install`  

then run;

`$ yarn dev`


That will spin up the `df-plugin-dev-server` and all you'll need to do is create a new plugin with this code:

```
export { default } from "http://127.0.0.1:2222/plugin.ts?dev"
```

This will setup some configuration client side to pull in code from your local machine. (HMR soon tm)

df-plugin-dev-server is built by [phated](https://github.com/phated) a prolific Open Source contributor, go checkout the [repo](https://github.com/projectsophon/df-plugin-dev-server) if you want to learn more!







