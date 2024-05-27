# Rogue Plasma
A simple electron wrapper for [PokéRogue](https://github.com/pagefaultgames/pokerogue) (as well as other web-apps)

### Setup
#### Prerequisites
- node: 20.3.1 or higher
- npm: [how to install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### Optionally
- git (to automate forking, cloning and merging different mods; though copying and editing files manually also works)

#### Setup Locally
1. Clone this repo and PokéRogue or a fork.
2. Adjust the `config.json` with the correct path to the PokéRogue. (if necessary)
3. Run `npm install` in the root directory of both repos.

#### Running Locally
1. Run `npm start` for Rogue Plasma

### Notes
This is just a *simple* wrapper, so there are no fancy function such as automatically pulling a configured repository, offering a mod-list or anything else.

If you just want to run the game, locally, please use the [Pokerogue-App](https://github.com/Admiral-Billy/Pokerogue-App/releases).
This is for those who want to install some mods and maybe even edit the game a bit. But don't want it to run in the browser, for whatever reason
