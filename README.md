## Loot Bot

[![Build Status](https://travis-ci.org/damoresa/taskmanager.svg?branch=master)](https://travis-ci.org/damoresa/taskmanager)

_loot-bot_ has been developed to ease managing loot on the MMO [Tibia](http://www.tibia.com).  
The application consists of a [_Discord_](https://discordapp.com/) bot and a _VueJS_ web application.
  
At this point in time you can __only__ submit new loot reports and expenses 
__through the bot interface__, even though web application support is 
under development.  
  
All authentication is managed throught _Discord_ meaning you __need__ a _Discord_ 
account in order to use the application.

### Features

* Submit loot reports: storing statistical information about your hunt.
* Manage loot shares: share the hunt code with your team mates and allow them 
to add their expenses, the application will automatically share loot.
* Track your statistics: keep track of your hunts and the amount of experience, 
total loot and your share of said loot easily.

### Loot distribution

Your share of the loot is calculated following these steps:

1. Sum all the reported expenses for the hunt.
2. Calculate whether the total loot value is higher than the total expenses value.
  2.1. If the loot is higher (profit) - everyone is given their expense and then the remainder is shared evenly.
  2.2. If the expenses are higher (waste) - everyone is given a percentage or the loot proportional to their reported expense.

### Future features

* Submit loot reports through the web application.
* Submit expenses through the web application.

### Possible future features

* Attach your characters to your _Discord_ account.
* Receive recommendations on what to hunt depending on your results.