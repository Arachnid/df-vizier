# DF Vizier

This plugin implements an AI player for ~Dwarf Fortress~ Dark Forest.

The AI is "agent-based"; that is, each planet acts independently, though with knowledge of the global state. A series of action types are defined (such as claiming an artefact, attacking a planet, etc). Each round, each planet calls each action type handler in order until it finds an action that it should execute.

Once a round completes, the AI waits until all triggered transactions have completed before starting a new round.

Currently defined action handlers (in priority order):
 1. Prospect & find artefacts
 2. Upgrade planets and send silver
 3. Send energy to friendly planets
 4. Capture hostile planets

Handlers that involve sends typically have a common structure: they take in a list of candidate planets that are reachable from the current planet, filter it on certain criteria (such as owner, incoming attacks, level etc), then score all matching planets using a scoring function. Finally they iterate through the candidates in score order until they find a candidate that meets the requirement for the action (if any).

Several scoring functions are defined:
 - A general 'planet score', intended to reflect the planet's desirability to capture and retain. Planets are also evaluated in this order on each run.
 - A 'silver need score', reflecting the planet's need for silver to be sent to it.
 - An 'energy need score', reflecting the planet's need for energy to be sent to it.

When a planet is evaluating a target for capture, the general score of the planet is divided by 'effort' - the amount of resources required to capture that planet, and planets are sorted by 'effort'. This avoids the AI putting in enormous effort to capture desirable but inaccessible planets. Modifiers are also applied if a planet can attack but not completely capture a target.

Each run a 'state' variable is maintained, containing dynamic state of interest to handlers; this includes information on the expected incoming energy and silver to each planet, and helps action handlers avoid overallocating sends of energy or silver to target planets.

The UI, such as it is, displays all upcoming actions, and what percentage of the required resource the planet is at before it can enact the action. All settings are made via constants in the source code.

To get started run:

`$ yarn install`  

then run;

`$ yarn dev`

That will spin up the `df-plugin-dev-server` and all you'll need to do is create a new plugin with this code:

```
export { default } from "http://127.0.0.1:2222/plugin.ts?dev"
```

This will setup some configuration client side to pull in code from your local machine.







