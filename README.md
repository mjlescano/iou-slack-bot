IOU Slack Bot
=============

[![Greenkeeper badge](https://badges.greenkeeper.io/mjlescano/iou-slack-bot.svg)](https://greenkeeper.io/)

Keep track of your debts with your peers.

## Commands
```
iou              # Shows all your debts
iou @user        # Get a list of your accounts with @user
iou @user $20    # Add $20 to your debt to @user (the "$" is optional)
ask @user $20    # Make @user owe you $20 more
iou help         # Shows this message
iou history      # Shows a list of all the transactions you where involved
```

## Install

#### 1. Deploy
You can simply deploy it on Heroku by pressing this button:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Or just run it on your own server:

1. Setup a [MongoDB](https://mongodb.org) instance, and configure the url with on the environment variable `MONGO_URL`.
2. Generate a random token (maybe [here](http://randomkeygen.com/)?), and set it on the env var `TOKEN`.
3. Start the bot with `npm start`.

#### 2. Configure it on your Slack Team

Create an "Outgoing WebHook" [here](https://slack.com/apps/A0F7VRG6Q-outgoing-webhooks). With this settings (change them as you wish, very opinionated):

* **Channel:** `#iou`
* **Trigger Word(s):** `iou,ask`
* **URL(s):** The url of your server with a trailing `/bot`. e.g.: `https://iou-slack-bot.herokuapp.com/bot`
* **Token:** The `TOKEN` you generated on "Deploy" step. (if heroku, get it with `heroku config:get TOKEN`)
* **Descriptive Label:** `iou`
* **Customize Name:** `IOU Slack Bot`
* **Customize Icon:** `:money_with_wings:` emoji. **THIS IS THE MOST IMPORTANT SETTING** :scream:

#### 3. Ω

## Tests
Meh.

## License
GPL-v3
