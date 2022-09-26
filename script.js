//CLASSES
class Player {
    static instances = []
    constructor(name,symbol,symbolRef,isComputer,difficulty=0,depth=0,catchPhrase='') {
        this.name = name
        this.symbol = symbol
        this.symbolRef = symbolRef
        this.audio = new Audio(`aud/${symbol}.mp3`)
        this.audio.volume = 0.4
        this.isComputer = isComputer
        this.difficulty = difficulty
        this.depth=depth
        this.score = 0
        this.record = {} //whenever a player object versus an opponent, the opponent is added to .record (key is opponents name) and incremeneted when they beat that player
        this.avatar = `img/${this.name}.png`
        this.catchPhrase = catchPhrase

        Player.instances.push(this)
    }
}


class Timer {
    constructor(d,a) {
        this.duration = d 
        this.intervalID = ''
        this.timeLeft = d
        this.isActive = a
    }

    countDown() {
        if (this.isActive){
            if (this.timeLeft === 0) {
                document.querySelector('.timer').innerHTML = '0.0'
                computerMove() //computerMove() calls timer.start so no need to do so here
                return
            } 
            let displayVal = this.timeLeft
            if (this.timeLeft > 5) {
                displayVal = Math.floor(displayVal)
            } else if (Number.isInteger(displayVal)) {
                displayVal = displayVal.toString() + '.0'
            }
            document.querySelector('.timer').innerHTML = displayVal
            this.timeLeft-=0.1
            this.timeLeft = Math.floor((this.timeLeft+0.02)*10)/10
        } else {
            document.querySelector('.timer').innerHTML = ''
            this.stop()
        }
    }

    start() {
        clearInterval(this.intervalID)
        this.timeLeft=this.duration
        this.intervalID=setInterval(this.countDown.bind(this),100)
    }
    stop() {
        clearInterval(this.intervalID)
        document.querySelector('.timer').innerHTML = ''
    }
}

class Settings {
    constructor(vol=0.4,timerActive=false,timerDuration=10) {
        this.vol = vol
        this.timerActive = timerActive
        this.timerDuration = timerDuration
    }

}

class Node {
    static instances = []
    constructor(id,row,col) {
        this.id='n'+id
        this.row=row
        this.col=col
        this.isOnLeftDiag = this.row === this.col ? true:false
        this.isOnRightDiag = this.row+this.col === size-1 ? true:false        
        this.symbol=null
        Node.instances.push(this)
    }
    addNodeListener() {
        const nodeDiv = document.querySelector('#'+this.id)
        const listenerFunction = ()=>{ 
            let result = true //being set to true prevents a bug when a player spams lots of nodes quickly 
            if (playersPlaying[0].isComputer) {
                result = false //If player[0] is a bot result = true will not let the game begin
            } 
            timer.start()
            if (!playersPlaying[turnIndex].isComputer) {
                result = move(playersPlaying[turnIndex],this) //move returns 'win'/'draw'
            }
            if (!result) {
                if (playersPlaying[turnIndex].isComputer) {
                    timer.stop()
                    setTimeout(computerMove,700)
                }
            }
        }
        nodeDiv.addEventListener('click',listenerFunction)
    }
}

//FUNCTIONS

const generateBoard = (size=3) => {
    memo = {}
    turnIndex = 0
    timer.stop()
    //adjust board grid to fit all the squares
    const board = document.querySelector('.board')
    board.innerHTML=''
    frString = '1fr '.repeat(size)
    nodeList=[]
    board.style.gridTemplateColumns = frString
    board.style.gridTemplateRows = frString

    const leftPanel = document.querySelector('#leftPanel')
    const rightPanel = document.querySelector('#rightPanel')
    leftPanel.classList.toggle('turn',true)
    rightPanel.classList.toggle('turn',false)
    //add lits to the winLines for all rows and cols
    //first, reset winLines
    winLines = {
        winRows: {},
        winCols: {},
        winDiags: {},
    }
    //add empty lists
    for (let row=0;row<size;row++) {
        winLines.winRows[row]=[]
    }
    for (let col=0;col<size;col++) {
        winLines.winCols[col]=[]
    }
    //always only 2 diag win lines
    winLines.winDiags.left=[]
    winLines.winDiags.right=[]
    //create nodes and add html representations to the DOM
    for (let row=0;row<size;row++) {

        for (let col=0;col<size;col++) {
            let node = new Node(row*size+col,row,col)
            let nodeDiv = document.createElement('div')
            nodeList.push(node)
            nodeDiv.classList.add('node')
            nodeDiv.setAttribute('id',node.id)
            nodeDiv.setAttribute('row',node.row)
            nodeDiv.setAttribute('col',node.col)
            nodeDiv.setAttribute('grid-row',`${node.row+1}/${node.row+2}`)
            nodeDiv.setAttribute('grid-column',`${node.col+1}/${node.col+2}`)
            
            board.appendChild(nodeDiv)
            node.addNodeListener()

            //add nodes to winLines
            winLines.winRows[row].push(node)
            winLines.winCols[col].push(node)
            if (node.isOnLeftDiag) {
                winLines.winDiags.left.push(node)
            }
            if (node.isOnRightDiag) {
                winLines.winDiags.right.push(node)
            }
        }
    }
}

const move = (player,node) => {
    if (node.symbol === null) { 
        //adding check for connect 4 and handling move differnetly 
        numMoves+=1
        if (gameChoice==='c4') {
            //find the lowest empty node in the column that was selected, overwrite input node with this node.
            selectedCol = node.col
            for (n of nodeList) {
                if (n.col===selectedCol & n.row > node.row & n.symbol===null) {
                    node = n
                }
            }
        }

        nodeDiv = document.getElementById(node.id)
        nodeDiv.style.backgroundImage = `url(${player.symbolRef})`
        node.symbol = player.symbol
        player.audio.play()
        const leftPanel = document.querySelector('#leftPanel')
        const rightPanel = document.querySelector('#rightPanel')
        leftPanel.classList.toggle('turn')
        rightPanel.classList.toggle('turn')

        const result = checkWin(player,node) // edit checkWin to handle connect4


        if (result === 'win') {
            player.score+=1
            showWin(player)
            updatePlayerRecords(player,playersPlaying[Math.abs(turnIndex-1)])
            updatePlayerPanels()
            savePlayerData()

            return result
        }   
        if (result === 'draw') {
            showDraw()

            return result
        }
        turnIndex = Math.abs(turnIndex-1) //bounces between 1 and 0
        return false
    }
}

const randomMove = () => {
    
}

const checkWin = (player,node) => {
    //Keeping exitsting win check for tic-tac-toe the same. Adding secondary function within checkWin for connect-4
    if (gameChoice === "tic") {
        const symbolToCheck = player.symbol
        const row=winLines.winRows[node.row]
        const col=winLines.winCols[node.col]
        const leftDiag=winLines.winDiags.left
        const rightDiag=winLines.winDiags.right
        let rowCount = 0
        let colCount = 0
        let leftDiagCount = 0
        let rightDiagCount = 0
        let totalCount = 0
        for (n of row) {
            if (n.symbol===symbolToCheck) {
                rowCount+=1
            }
        }
        for (n of col) {
            if (n.symbol===symbolToCheck) {
                colCount+=1
            }
        }
        if (node.isOnLeftDiag) { //only check diagonal win if clicked node was on a diagonal
            for (n of leftDiag) {
                if (n.symbol===symbolToCheck) {
                    leftDiagCount+=1
                }
            }
        }
        if (node.isOnRightDiag) { //only check diagonal win if clicked node was on a diagonal
            for (n of rightDiag) {
                if (n.symbol===symbolToCheck) {
                    rightDiagCount+=1
                }
            }
        }

        for (n of nodeList) { // draw check
            if (n.symbol !== null) {
                totalCount+=1
            }
        }

        const longestLine = Math.max(rowCount,colCount,leftDiagCount,rightDiagCount)
        if (longestLine===parseInt(size)) {
            
            return 'win'
        } 
    } else {//win checking for connect 4. check in all directions from clicked node for 4 in a row
        //check left and right
        let longestLine = 0
        const col = node.col
        const row = node.row
        let horizintalNodes = []
        let verticalNodes = []
        let diagonalLeftNodes = []
        let diagonalRightNodes = []
        
        //add horizontal nodes to check
        for (let i = -3; i<=3;i++) {
            if (col+i >= 0 & col+i <= size-1) {
                let validNode = nodeList.find(e=>e.row===row & e.col===col+i)
                horizintalNodes.push(validNode)
            }
        }
        //add vertical nodes to check (only need to check below)
        for (let i = 0; i<=3;i++) {
            if(row+i <= size-1) {
                let validNode = nodeList.find(e=>e.col===col & e.row===row+i)
                verticalNodes.push(validNode)
            }
        }
        
        //add diagonal leftward nodes to check
        for (let i = -3; i<=3;i++) {
            if (col+i >= 0 & col+i <= size-1 & row+i >= 0 & row+i <= size-1) {
                let validNode = nodeList.find(e=>e.row===row+i & e.col===col+i)
                diagonalLeftNodes.push(validNode)
            }
        }

        //add diagonal rightward ndoes to check
        for (let i = -3; i<=3;i++) {
            if (col-i >= 0 & col-i <= size-1 & row+i >= 0 & row+i <= size-1) {
                let validNode = nodeList.find(e=>e.row===row+i & e.col===col-i)
                diagonalRightNodes.push(validNode)
            }
        }


        //check longest line in horizontals
        for (n of horizintalNodes) {
            if (n.symbol===player.symbol) {
                longestLine+=1
                if (longestLine >= 4) {
                    return 'win'
                }
            } else {
                longestLine = 0
            }
        }
        longestLine = 0

        //check longest line in vertical
        for (n of verticalNodes) {

            if (n.symbol===player.symbol) {
                longestLine+=1
                if (longestLine >= 4) {
                    return 'win'
                }
            } else {
                longestLine = 0
            }
        }
        longestLine = 0
        //check longest line in left Diagonal
        for (n of diagonalLeftNodes) {
            if (n.symbol===player.symbol) {
                longestLine+=1
                if (longestLine >= 4) {
                    return 'win'
                }
            } else {
                longestLine = 0
            }
        }
        longestLine = 0
        //check longest line in right Diagonal
        for (n of diagonalRightNodes) {
            if (n.symbol===player.symbol) {
                longestLine+=1
                if (longestLine >= 4) {
                    return 'win'
                }
            } else {
                longestLine = 0
            }
        }


    }
    //check for draw
    let totalCount = 0
    for (n of nodeList) { 
        if (n.symbol !== null) {
            totalCount+=1
        }
    }
    if (totalCount===nodeList.length) {
        return 'draw'
    }

}

const showWin = (player) => {
    //highlight winning lines
    //display result overlay
    //update player score
    //update local storage for player object
    timer.stop()
    setTimeout(() => {
        const img = document.createElement('img')
        const overlay = document.querySelector('.outcomeOverlay')
        const content = document.querySelector('.content')
        overlay.classList.toggle('showOutcome')
        content.classList.toggle('hideContent')
        overlay.insertBefore(img,overlay.querySelector('h4'))
        overlay.querySelector('img').setAttribute('src',player.avatar)
        overlay.querySelector('h1').innerHTML = player.name + ' WINS'
    },200)


}

const showDraw = () => {

    timer.stop()
    setTimeout(() => {
        const overlay = document.querySelector('.outcomeOverlay')
        const content = document.querySelector('.content')
        overlay.classList.toggle('showOutcome')
        content.classList.toggle('hideContent')
        overlay.querySelector('img').remove()
        overlay.querySelector('h1').innerHTML = 'DRAW'
    },200)

}






const computerMove = () => {
    timer.stop()
    const getGameState = () => {
        return nodeList.map((node) => {
            return node.symbol 
        })
    }

    const loadGameState = (state,pstate) => {
        let i = 0
        for (symbol of state) {
            nodeList[i].symbol = symbol
            i++
        }
        playerIndex = pstate
    }
    
    const getScore = (player,node) => {
        if (checkWin(player,node)==='win') {
            if (player===playersPlaying[initTurnIndex]) {
                return 100
            } else {
                return -100
            }
        } else if (checkWin(player,node)==='draw') {
            return 10
        } else {
            return 0
        }
    }
    
    const getMaxIndex = (arr) => {
        let maxIndex = 0
        let max = -Infinity
        let count=0
        arr.forEach((e) => {
            if (e>max) {
                max=e
                maxIndex=count
            } else if (e===max) { // add some randomness
                maxIndex = Math.random()>0.1 ? maxIndex : count
            }
            count++
        })
        return maxIndex
    }

    const getMinIndex = (arr) => {
        let minIndex = 0
        let min = Infinity
        let count=0
        arr.forEach((e) => {
            if (e<min) {
                min=e
                minIndex=count
            } else if (e===min) { // add some randomness to equally scored moves
                minIndex = Math.random()>0.1 ? minIndex : count
            }
            count++
        })
        return minIndex
    }

    const countNullNodes = (arr) => {
        let count=0
        arr.forEach((e)=>{
            if (e===null) {
                count+=1
            }
        })
        return count
    }

    const getMove = (gameState,playerState,d) => {

        if (gameChoice === 'c4' & d > depth) { //implementing depth for connect 4 mini max. 
            return 0
        }
        if (countNullNodes(gameState)>initPlayer.difficulty/(gameChoice==='tic' ? 100 : 1)) { //this code is implemented to reduce bot runtimes at large board sizes
            //depth can be adjusted as a difficulty. bot plays randomly unitl there are 'difficulty' no. of unfilled squres remainng. (i.e 9=full depth in 3x3, 0 = full random)
            let randomChoice = Math.floor(Math.random()*nodeList.length)
            do {
                randomChoice = Math.floor(Math.random()*nodeList.length)
                choice = nodeList[randomChoice]
            } while (nodeList[randomChoice].symbol!==null)

        } else {

            let memoKey = ''
            gameState.forEach((e)=> {
                memoKey+=e
            })
            memoKey+=toString(initPlayer)
            if (gameChoice === "c4"){
                memoKey+=numMoves //recalculate same states at deeper depths.
            }
            if (!(memoKey in memo)) {
                const scores = []
                const moves = []
                let node
                const currentPlayer = playersPlaying[playerState]
                for (let i = 0; i < nodeList.length ; i++) {
                    loadGameState(gameState,playerState) 
                    node = nodeList[i]
                    //if the node below the one its checking is null, skip it
                    if (gameChoice === 'c4') {
                        let nodeBelow = nodeList.find(e=>parseInt(e.id.slice(1))===parseInt(node.id.slice(1))+size)
                        if (nodeBelow !== undefined) {
                            if (nodeBelow.symbol === null) {//dont check nodes that cant be played in
                                continue
                            }
                        }
                    }
                    if (node.symbol===null) {
                        node.symbol=currentPlayer.symbol
                        let currentScore = getScore(currentPlayer,node) 
                        if (currentScore!==0) { 
                            choice = node
                            memo[memoKey]=[choice,currentScore]
                            
                            return getScore(currentPlayer,node)
                        }
        
                        moves.push(node) 
                        scores.push(getMove(getGameState(),Math.abs(playerState-1),d+1))
                    } 
                } 

                if (currentPlayer===playersPlaying[initTurnIndex]) {
                    maxScoreIndex = getMaxIndex(scores)
                    choice = moves[maxScoreIndex]
                    memo[memoKey]=[choice,(scores[maxScoreIndex]+(scores.reduce((a, b) => a + b,0) / scores.length**3))*0.95] 
                    // in the above, *0.9 encourages the bot to prolong losses and take faster wins, by reducing the score (less negative for later losses and more positive for sooner wins) of deeper recursive calls.  
                    //by adding a portion of the average result to the final score (the reduce function), the bot favours moves that have more winning outcomes even if they are technically draws/losses against a perfect opponent. This makes the bot more aggresively try get three in a row
                    return memo[memoKey][1]
                } else {
                    minScoreIndex = getMinIndex(scores)
                    choice = moves[minScoreIndex]
                    memo[memoKey]=[choice,(scores[minScoreIndex]+(scores.reduce((a, b) => a + b,0) / scores.length**3))*0.95]
                    return memo[memoKey][1]

                }
            } else {

                choice = memo[memoKey][0]
                return memo[memoKey][1]
            }
        }
    }
    const minRow = Math.min(...nodeList.map(n => n.symbol!=null ? n.row : 6 ))

    const initGameState = getGameState()
    const initTurnIndex = turnIndex 
    const initPlayer = playersPlaying[turnIndex]
    const depth = initPlayer.depth
    let choice
    getMove(initGameState,initTurnIndex,0)
    loadGameState(initGameState,initTurnIndex)
    const result = move(playersPlaying[turnIndex],choice)


    //move function has now iterated turnInedex to the next player
    //if the next player is also a bot, continue calling computerMove until move returns a game ending result
    if (!result & playersPlaying[turnIndex].isComputer) {
        setTimeout(computerMove,900)
    } else if (!result) {
        timer.start()
    }

}


const createBots = () => {
    const symbol = 'x'
    const botList = {}
    botList['Philip']=(new Player('Philip',symbol,`img/${symbol}.png`,true,100,1))
    botList['Laika']=(new Player('Laika',symbol,`img/${symbol}.png`,true,600,2))
    botList['Burke']=(new Player('Burke',symbol,`img/${symbol}.png`,true,5000,6))
    
    const htmlLeftSelect = document.querySelector(`#leftBotList`)
    const htmlRightSelect = document.querySelector(`#rightBotList`)
    let htmlOptions = ''
    for (bot in botList) {
        htmlOptions+=`<option id="${botList[bot].name}">${botList[bot].name}</option>`
    }
    htmlLeftSelect.innerHTML=htmlOptions
    htmlRightSelect.innerHTML=htmlOptions
    return botList
}


const updatePlayers = (player0,player1) => {
    playersPlaying[0] = player0
    playersPlaying[0].symbol ='x'
    playersPlaying[0].symbolRef ='img/x.png'
    playersPlaying[0].audio = new Audio(`aud/x.mp3`)

    playersPlaying[1] = player1
    playersPlaying[1].symbol ='o'
    playersPlaying[1].symbolRef ='img/o.png'
    playersPlaying[1].audio = new Audio(`aud/o.mp3`)


    //reset the session score of every player
    for (p of Player.instances) {
        p.score=0
    }

    updatePlayerPanels()
}

const updatePlayerPanels = () => {
    timer.stop()
    const leftPlayer = playersPlaying[0]
    const rightPlayer = playersPlaying[1]
    const leftimg = leftPlayer.avatar
    const rightimg = rightPlayer.avatar
    const leftName = leftPlayer.name + (leftPlayer.isComputer ? ' <span class = medium>(Computer)</p>' : '')
    const rightName = rightPlayer.name + (rightPlayer.isComputer ? ' <span class = medium>(Computer)</p>' : '')
    const leftDifficultyDescription = leftPlayer.difficulty < 40 ? 'Novice' : leftPlayer.difficulty < 90 ? 'Intermediate' : 'Master'
    const rightDifficultyDescription = rightPlayer.difficulty < 40 ? 'Novice' : rightPlayer.difficulty < 90 ? 'Intermediate' : 'Master'
    const leftCatchPhrase = leftPlayer.catchPhrase
    const rightCatchPhrase = rightPlayer.catchPhrase
    const leftScore = leftPlayer.score
    const rightScore = rightPlayer.score

    let leftRecord = leftPlayer.record[rightPlayer.name]
    let rightRecord = rightPlayer.record[leftPlayer.name]

    //if these two players have never faced eachother, the record key does not exist yet, so create it and set it to 0
    if (leftRecord===undefined) {
        leftPlayer.record[rightPlayer.name] = 0
        leftRecord = 0
    }
    if (rightRecord===undefined) {
        rightPlayer.record[leftPlayer.name]=0
        rightRecord = 0
    }

    const leftPanel = document.querySelector('#leftPanel')
    const rightPanel = document.querySelector('#rightPanel')

    leftPanel.querySelector('img').setAttribute('src',leftimg)
    rightPanel.querySelector('img').setAttribute('src',rightimg)
    
    if (leftPlayer.isComputer) {
        leftPanel.querySelector('ul').innerHTML = `<li>${leftName}</li><li>${leftDifficultyDescription}</li>`
    } else {
        leftPanel.querySelector('ul').innerHTML = `<li>${leftName}</li><li>"${leftCatchPhrase}"</li>`
    }
    
    if (rightPlayer.isComputer) {
        rightPanel.querySelector('ul').innerHTML = `<li>${rightName}</li><li>${rightDifficultyDescription}</li>`
    } else {
        rightPanel.querySelector('ul').innerHTML = `<li>${rightName}</li><li>"${rightCatchPhrase}"</li>`
    }

    leftPanel.querySelector('.record').innerHTML = `Record vs ${rightPlayer.name}: ${leftRecord}`
    rightPanel.querySelector('.record').innerHTML=`Record vs ${leftPlayer.name}: ${rightRecord}`

    leftPanel.querySelector('.score').innerHTML = `Score: ${leftScore}`
    rightPanel.querySelector('.score').innerHTML = `Score: ${rightScore}`


}

const updatePlayerRecords = (winner,loser) => {
    winner.record[loser.name]+=1
}


const savePlayerData = () => {
    let playerData={}
    for (p of Player.instances) {
        playerData[p.name]=p
    }
    stringPlayerData = JSON.stringify(playerData)
    storage.setItem('playerData',stringPlayerData)
}


const loadPlayerData = () => {
    const playerData = storage.getItem('playerData')
    const playerDataObject = JSON.parse(playerData)
    const defulatNames = ['Philip','Laika','Burke','Player 1','Player 2']
    const customPlayers = {}
    for (let playerKey in playerDataObject) {
        let loadedPlayer=playerDataObject[playerKey]
        if (defulatNames.includes(loadedPlayer.name)) { //if the player instance is one of the defaults, just update the necessary properties of the existing default objects (the score record)
            for (i of Player.instances) {
                if (i.name === loadedPlayer.name) {
                    i.record=loadedPlayer.record
                }
            }
        } else {
            //create new player instance of custom players 
            let p = loadedPlayer
            let reloadedCustom = new Player(p.name,p.symbol,p.symbolRef,p.isComputer,p.difficulty,p.catchPhrase)
            customPlayers[reloadedCustom.name]=reloadedCustom
        }
    }
    return customPlayers
}

const saveSettingsData = (settings) => {
    storage.setItem('settingsData',JSON.stringify(settings))
}

const loadSettingsData = () => {
    const settingsData = storage.getItem('settingsData')
    let settings
    if (settingsData !==null) {
        console.log('loaded settings')
        settings =  JSON.parse(settingsData)
    } else {
        settings = new Settings
        console.log('created default settings')
    }
    document.querySelector('#volumeInput').value=settings.vol*100
    document.querySelector('#timerDuration').value=settings.timerDuration
    document.querySelector('#timerSwitch').checked=settings.timerActive
    return settings
}

const updateSettings = () => {

    //call this on load and on settings window close
    currentSettings.vol=document.querySelector('#volumeInput').value/100
    currentSettings.timerDuration=Math.max(document.querySelector('#timerDuration').value,2) //2 second minimum on timer interval
    currentSettings.timerActive=document.querySelector('#timerSwitch').checked
    for (i of Player.instances) {
        i.audio.volume=currentSettings.vol
    }
    //update other settings
    timer.duration = currentSettings.timerDuration
    timer.isActive = currentSettings.timerActive
    saveSettingsData(currentSettings)
}



//=============================================Game flow=============================================//






//GLOBAL VARIABLES
let storage = localStorage

const leftBots = createBots()
const rightBots = createBots() 
let numMoves = 0

const defaultLeft = new Player('Player 1','x','img/x.png',false,0,0,'Tickity Tackity')
const defaultRight = new Player('Player 2','o','img/o.png',false,0,0,'1, 2, 3, 4, something something -AK')


let playersPlaying = {
    '0':defaultLeft,
    '1':defaultRight,
}



let turnIndex = 0
let nodeList = []
let winLines = {
    winRows: {},
    winCols: {},
    winDiags: {},
}
let size = 3
let memo = {}

const currentSettings = loadSettingsData()
const customPlayers = loadPlayerData()
const timer = new Timer(currentSettings.timerDuration,currentSettings.timerActive)
let gameChoice = 'tic'
savePlayerData()
updatePlayerPanels()
updateSettings()
generateBoard(size)



//EVENT LISTENERS

document.getElementById('decreaseSize').addEventListener('click',(e)=> {
    if (size > 2) {
        size -=1
        generateBoard(size)
    }
})
document.getElementById('increaseSize').addEventListener('click',(e)=> {
    if (size < 15) {
        size +=1
        generateBoard(size)
    }
})


document.querySelector('.outcomeOverlay').addEventListener('click',()=>{
    const overlay = document.querySelector('.outcomeOverlay')
    const content = document.querySelector('.content')
    overlay.classList.toggle('showOutcome')
    content.classList.toggle('hideContent')
    generateBoard(size)
})





const leftBotSwitch = document.querySelector('#leftPanel input[type="checkbox"')
const rightBotSwitch = document.querySelector('#rightPanel input[type="checkbox"')
const leftBotSelect = document.querySelector('#leftBotList')
const rightBotSelect = document.querySelector('#rightBotList')
const leftPanel = document.querySelector('#leftPanel')
const rightPanel = document.querySelector('#rightPanel')
const board = document.querySelector('.board')



leftBotSwitch.addEventListener('click',(e)=>{
    leftBotSelect.classList.toggle('vis')
    if (leftBotSwitch.checked) {
        //means we are adding a bot
        const botName = leftBotSelect.value
        const leftPlayer = leftBots[botName]
        updatePlayers(leftPlayer,playersPlaying[1]) //retain Right hand player (players[1])
    } else {
        updatePlayers(defaultLeft,playersPlaying[1])//ditto below
        //add default human player 1
    }
    generateBoard(size)

})

rightBotSwitch.addEventListener('click',(e)=>{
    rightBotSelect.classList.toggle('vis')
    if (rightBotSwitch.checked) {
        //means we are adding a bot
        const botName = rightBotSelect.value
        const rightPlayer = rightBots[botName]
        updatePlayers(playersPlaying[0],rightPlayer) //retain Right hand player (players[1])

    } else {
        updatePlayers(playersPlaying[0],defaultRight)
        //add default human player 2
    }
    generateBoard(size)

})

leftBotSelect.addEventListener('click',(e)=>{
    const botName = leftBotSelect.value
    const leftPlayer = leftBots[botName]
    if (playersPlaying[0] !== leftPlayer) {
        generateBoard(size)
    }
    updatePlayers(leftPlayer,playersPlaying[1])
})

rightBotSelect.addEventListener('click',(e)=>{
    const botName = rightBotSelect.value
    const rightPlayer = rightBots[botName]
    if (playersPlaying[1] !== rightPlayer) {
        generateBoard(size)
    }
    updatePlayers(playersPlaying[0],rightPlayer)
})


document.querySelector('.startScreen').addEventListener('click',(e)=>{
    document.querySelector('.startScreen').classList.add('hidden')
    // document.querySelector('.startScreen').classList.remove('partial')
    leftPanel.classList.remove('hideLeft')
    rightPanel.classList.remove('hideRight')
    board.classList.remove('hidden')
})

document.querySelector('#settingsOpen').addEventListener('click',(e) => {
    const settingsOverlay = document.querySelector('.settings')
    const settingsContent = document.querySelector('.settingsContent')
    const openGIF = document.createElement('img')
    openGIF.setAttribute('id','scroll')
    openGIF.src =  'img/scroll-open-gif.gif?q=' + new Date().getTime();
    settingsOverlay.appendChild(openGIF)
    settingsOverlay.classList.remove('hidden')
    

    setTimeout(() => {
        settingsContent.classList.remove('hidden')
    }, 200);

    setTimeout(() => {
        if (openGIF.src.includes("open")) {
            openGIF.src='img/scroll.gif'
        }
    }, 600);
})

document.querySelector('#exitSettings').addEventListener('click',(e) => {
    const settingsOverlay = document.querySelector('.settings')
    const closeGIF = settingsOverlay.querySelector('#scroll')
    const settingsContent = document.querySelector('.settingsContent')
    updateSettings()
    
    settingsContent.classList.add('hidden')
    closeGIF.src =  'img/scroll-close-gif.gif?q=' + new Date().getTime();

    
    setTimeout(() => {
        settingsOverlay.querySelector('#scroll').remove()
        settingsOverlay.classList.add('hidden')
    }, 600);
})


document.querySelector('#c4button').addEventListener('click',(e)=>{
    if (gameChoice==='tic') {
        gameChoice = 'c4'
        size = 7
        generateBoard(size)
    } else {
        gameChoice = 'tic'
        size = 3
        generateBoard(size)

    }

})