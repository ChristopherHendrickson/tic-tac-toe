# TIC-TAC-TOE
## By Chris
This app is hosted at [https://christopherhendrickson.github.io/tic-tac-toe/](https://christopherhendrickson.github.io/tic-tac-toe/) 

### Technologies Used
-JavaScript
-HTML
-CSS

### Game Features

1. Bot Mode with differnet difficulties
2. Adjustable board size 
3. Current score Tracking
4. Settings Panel
5. Custom Player Profiles (Can currently be rendered. Have not implemented a way to load or create profiles within the app)
6. Local Storage of player profile data and settings

#### Bot Mode

Either of the players can be set to play as a bot. Bot moves are calculated using a mini-max algorithm. Bot difficulty is represented as an integer. The difficulty is implemented by forcing the bot to make random moves (Not using the mini-max algorithm) until there are a 'difficulty' number of squares that can be played in remaining. A difficulty of 9 will therefore always use the algorithm on a 3x3 board, and a difficulty of 0 will always make random moves.

The mini-max algorithm path scoring has a reduction factor applied to it, as well as a portion of the average score from path branches below the current game state added. The reduction factor is implemented so that the bot does not 'give up' immediately after it has calculated every path as a loss, and prioritise sooner wins. The average scores are added so that paths with more winning outcomes are prioritised. Without this addition, since the bots always assume the opponent will be able to make a draw, it would never attemp to connect 3 in a row and only block when necessary.

#### Adjustable board size

The board is created using a JavaScript Node object and a DOM Node representation of the object. this object has a method to add a node listener to a DOM element with the same id as itself. On board creation, DOM nodes and JavaScript nodes are created simultaneously. 
The board is created using CSS grids. Adjusting the board size calls the generateBoard() function, which creates size^2 Nodes, and adjusts the board grid template cols and rows to fit each node.   

#### Score Tracking

When playing the game, two instances of the class Player are vsing eachother. each player could be a human player or a bot. When a player wins, the players score property is incremented by one and displayed in the players panel. This score is reset on page reset and when a new profile is selected to play. The player object also has a property called 'record'. This is an object that contains the names of every opponent they have versed with a running total of their score against each. thisrecord  is saved permanently.

#### Settings Panel

The settings panel allows you to adjust the game volume, activate turn time limts, and adjust the time limit. When time limits are active a timer will be dsiplayed on screen. If a move is not made before the timer runs out, a random move is done automatically. This is implemented by re-using the bots move function (te mini-max algorithm), with every human profile having a difficulty score of 0. 

#### Custom Player Profiles

The app is capable of rendering player panels and having games between any two instances of the Players class. There is currently no way to select or create a custom player from within the app.
Customizable features include the name, avatar image, and a catchphrase. Names must be unique as they are used as keys for the score records and as keys for the player data saved in local storage.

#### Local Storage

Player profiles and setttings data is saved in local storage after each match and when settings are adjusted. These are then loaded on window load. After each game, the record of the winning player is updated, and the player data is overwritten in local storage.

### Improvements/Existing Bugs

A custom player creation interface and a way to load the profile by name. This means there can be a running total for multiple players using the same machine vsing eachother.

Bot v bot games are activated by clicking on ny node. A start button would be better. This also means that the game cycle can be called multiple times simultaneously as more nodes are clicked, causing issues at the end of the game.