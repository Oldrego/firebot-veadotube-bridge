<img width="400" height="400" alt="scream" src="https://github.com/user-attachments/assets/e579de87-a839-41f3-a839-b1359d81819a" />

# Firebot-Veadotube Bridge

This is a simple plugin for [Firebot](https://firebot.app/) that allows it to communicate with [Veadotube](https://veado.tube/). (Yes, the full one.)

Currently working for **Firebot 5.67**, which is currently under beta. (They just made the Plugin system in that version, in case you're wondering why I'd do that.)

### Installing

Download the javascript file in [Releases](https://github.com/Oldrego/firebot-veadotube-bridge/releases), go to `Tools > Plugin Manager` within Firebot, and click on `Install From File`. Select the javascript file you downloaded.

### Building

If you want to build the file yourself, clone the repo into a folder of your choosing, and use the following command:

```
npm run build
```

The compiled plugin is written inside the `dist` folder. I used node v26.8.1, and npm 11.19.0.

### Features

Is able to do the following for all three websocket node types:

- Get a boolean node
- Set a boolean node
- Toggle a boolean node
- Clear a boolean node
- Get a number node
- Set a number node
- Add to a number node
- Clear a number node
- List states in a states node
- Get a state's thumbnail (???)
- Peek at the top state in a states node
- Set a state in a states node
- Push a state in a states node
- Pop a state in a states node
- Toggle a state in a states node
- Clear all states in a states node
- Marry a states node

Pretty much anything you so desire. (From websocket nodes.) Firebot also receives events and can react to:

- Node Changes
- Node List Changes
- Instance Connection Changes

And can filter those events by:

- Instance Name
- Node Id
- Node Type (Boolean, Number, and States)
- Whether something was Added or Removed from a list
- Boolean
- Number
- State

### Notes

- Using `Get Boolean` works as intended, but Firebot currently has a bug with `$effectOutput[bool]`. Booleans that are `false` are treated as `undefined` when you get them from `$effectOutput[bool]`. Instead, use `$&bool`. (I don't know, ask them, not me.)

- When using an Instance Name, refer to the entire name rather than just the project name. A brand new project would have an Instance Name of `veadotube - untitled dynamic avatar`, as an example. (You should see it on the title bar.)

- If you're ever wondering what's going on with the Veadotube connection in Firebot, you can look in `Tools > Toggle Developer Tools` (or press Ctrl+Shift+I) to get some debug information as events occur.
