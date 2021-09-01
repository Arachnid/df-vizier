# DF Vizier

This plugin implements an AI assistant player for ~Dwarf Fortress~ Dark Forest.

Vizier is structured around "action handlers"; each handler knows how to perform a specific action, such as mining for artifacts, upgrading planets, or sending energy. You decide what action handlers to activate on each planet you own. Each time Vizier does a run, it checks every planet you own, running all the enabled action handlers, in order, until one returns an action to execute.

Handlers have global settings affecting their behaviour; settings can be overriden on a per-planet basis.

Once a run completes, the AI waits until all triggered transactions have completed before starting a new round.

### UI
![planet_list.png]

When no planet is selected, Vizier shows a sortable table of all planets you own. Each action handler has a column with checkboxes for all planets it applies to, so handlers can be quickly toggled for each planet. Clicking on a planet in the left column will select it.

![planet_config.png]

When a planet is selected (via the planet list or otherwise), Vizier changes to showing configuration settings for that planet. Each supported handler is shown along with an 'enable' checkbox. When enabled, configuration setting overrides for that handler on the selected planet are shown; untick 'default' or make a change to a value to override that setting. Click 'Save' to commit your changes.

Some configuration options can be set on hostile planets. Selecting a hostile planet will show you these settings, but without the ability to enable or disable handlers.

Clicking 'Global Config' on any screen allows you to update default settings for all planets.

## Handler Configuration
By default Vizier runs in "dry run" mode, and does a run every 60 seconds. In dry run mode, actions are reported in the main UI, but not executed.

### ⛏️ Find Artifacts
This handler is automatically enabled on all Foundries, and unavailable elsewhere. It can be manually disabled if desired.

### 👑 Upgrade Planet
This handler is only available on Planets. By default it is disabled. To use, first set your desired upgrade paths and ranks in the global configuration, then enable on planets you want upgraded.

### 🔋 Send Energy
This handler is disabled by default. Enabled planets will, by default, send energy to other planets, either for attacks or to help refill friendly planets.

Each planet has a priority. Planets aim to send energy to the target planet with highest priority, after accounting for the efficiency of sending energy between the two planets. A graph search algorithm is used to ensure energy is sent by the most efficient route - so a low level planet will send to a neighbouring high level planet that has sends enabled, rather than trying to send to a distant planet directly.

Priorities default to 0 - meaning the planet will not receive energy for itself, only as part of a route to targets with nonzero priorities. The values of priorities matter only relative to each other, so you can use whatever numbers you feel comfortable with.

A number of other settings are confirable:
 - Min. energy reserve: The minimum percentage of the source planet's energy to retain after a send. Defaults to 15%.
 - Max send amount: The maximum percentage of source planet's energy cap to send at once. If a capture or top-up requires more energy than the planet can send at once, it will wait until it can send this percentage without eating into the reserve. Defaults to 70% - with the default reserve of 15% this means sends will typically happen at 85% energy.
 - Min capture energy: The minimum percentage of target energy cap to fill on a successful attack. Defaults to 5%.
 - Min target percentage: The minimum percentage of target energy cap to affect with a send. If a send would make a smaller impact than this, it is skipped entirely. Defaults to 5%.

## Installing and running

To get started run:

`$ yarn install`  

then run;

`$ yarn dev`

That will spin up the `df-plugin-dev-server` and all you'll need to do is create a new plugin with this code:

```
export { default } from "http://127.0.0.1:2222/plugin.js?dev"
```

This will setup some configuration client side to pull in code from your local machine.

Make sure you have mixed content enabled in your browser for the DF client, or the import will fail.
