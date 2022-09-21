class Player {
    static instances = []
    constructor(name,symbol,symbolRef,isComputer,difficulty=9,catchPhrase='') {
        this.name = name
        this.symbol = symbol
        this.symbolRef = symbolRef
        this.audio = new Audio(`aud/${symbol}.mp3`)
        this.audio.volume = 0.4
        this.isComputer = isComputer
        this.difficulty = difficulty
        this.score = 0
        this.record = {} //whenever a player object versus an opponent, the opponent is added to .record (ley is opponents name) and incremeneted when they beat that player
        this.avatar = `img/${this.name}.png`
        this.catchPhrase = catchPhrase  
        Player.instances.push(this)
    }


}


class Node {
    constructor(id,row,col) {
        this.id='n'+id
        this.row=row
        this.col=col
        this.isOnLeftDiag = this.row === this.col ? true:false
        this.isOnRightDiag = this.row+this.col === size-1 ? true:false        
        this.symbol=null
    }
    addNodeListener() {
        const nodeDiv = document.querySelector('#'+this.id)
        const listenerFunction = ()=>{ //making this a named function so i can auto loop over when two bots vs eachother
            console.log('=================================')
            // console.log(players[turnIndex].isComputer)
            let result
            if (!playersPlaying[turnIndex].isComputer) {
                result = move(playersPlaying[turnIndex],this) //move returns 'win' or 'draw'
            }
            if (result!=='win') {
                if (playersPlaying[turnIndex].isComputer) {
                    setTimeout(computerMove,400)
                }
            }
        }
        nodeDiv.addEventListener('click',listenerFunction)
    }
}



const generateBoard = (size=3) => {
    memo = {}
    turnIndex = 0
    //adjust board grid to fit all the squares
    const board = document.querySelector('.board')
    board.innerHTML=''
    frString = '1fr '.repeat(size)
    nodeList=[]
    board.style.gridTemplateColumns = frString
    board.style.gridTemplateRows = frString

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
        nodeDiv = document.getElementById(node.id)
        nodeDiv.style.backgroundImage = `url(${player.symbolRef})`
        node.symbol = player.symbol
        player.audio.play()
        // computerMove()
        // console.log('actual List')
        // console.log(nodeList)

        const result = checkWin(player,node)
        if (result === 'win') {
            showWin(player,node)
            player.score+=1
            updatePlayerRecords(player,playersPlaying[Math.abs(turnIndex-1)])
            updatePlayerPanels()
            savePlayerData()
            return result
        }   
        if (result ==='draw') {
            showDraw()
            return result
        }
        turnIndex = Math.abs(turnIndex-1) //bounces between 1 and 0

    }
}


const checkWin = (player,node) => {
    // console.log(player)
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

    for (n of nodeList) {
        if (n.symbol !== null) {
            totalCount+=1
        }
    }

    const longestLine = Math.max(rowCount,colCount,leftDiagCount,rightDiagCount)
    if (longestLine===parseInt(size)) {
        // console.log('win')


        return 'win'
    } else if (totalCount===nodeList.length) {
        // console.log('draw')
        return 'draw'
    }

}

const showWin = (player,node) => {
    //highlight winning lines
    //display result overlay
    //update player score
    //update local storage for player object
    const overlay = document.querySelector('.outcomeOverlay')
    const content = document.querySelector('.content')
    overlay.classList.toggle('showOutcome')
    content.classList.toggle('hideBoard')
    document.querySelector('#continue').style.display='inline-block'
}

const showDraw = () => {
    showWin(1,1)
}


const computerMove = () => {
    
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
            if (player===playersPlaying[initPlayerIndex]) {
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
            } else if (e===min) { // add some randomness
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

    const getMove = (gameState,playerState) => {

        if (countNullNodes(gameState)>initPlayer.difficulty) { //this code is implemented to reduce bot runtimes at large board sizes
            //depth can be adjusted as a difficulty. bot plays randomly unitl there are 'difficulty' no. of unfilled squres remainng. (i.e 9=full depth in 3x3, 0 = full random)
            console.log('choice was random')
            let randomChoice = Math.floor(Math.random()*nodeList.length)
            do {
                randomChoice = Math.floor(Math.random()*nodeList.length)
                choice = nodeList[randomChoice]
            } while (nodeList[randomChoice].symbol!==null)

        } else {

            // console.log(gameState)
            let memoKey = ''
            gameState.forEach((e)=> {
                memoKey+=e
            })
            memoKey+=toString(initPlayer)
            if (!(memoKey in memo)) {
                const scores = []
                const moves = []
                let node
                const currentPlayer = playersPlaying[playerState]
                for (let i = 0; i < nodeList.length ; i++) {
                    loadGameState(gameState,playerState)
                    node = nodeList[i]
                    if (node.symbol===null) {
                        node.symbol=currentPlayer.symbol
                        if (getScore(currentPlayer,node)!==0) { 
                            choice = node
                            memo[memoKey]=[choice,getScore(currentPlayer,node)]
                            
                            return getScore(currentPlayer,node)
                        }
        
                        moves.push(node) 
                        scores.push(getMove(getGameState(),Math.abs(playerState-1)))
                    } 
                } 
                if (currentPlayer===playersPlaying[initPlayerIndex]) {
                    maxScoreIndex = getMaxIndex(scores)
                    choice = moves[maxScoreIndex]
                    memo[memoKey]=[choice,(scores[maxScoreIndex]+scores.reduce((a, b) => a + b,0) / scores.length**3)*0.9] 
                    // in the above, *0.9 encourages the bot to prolong losses and take faster wins, by reducing the impact of deeper recursive calls.  
                    //by adding a portion of the average result to the final score (the reduce function), the bot favours moves that have more winning outcomes even if they are technically draws/losses against a perfect opponent. This makes the bot more aggresively try get three in a row
                    return memo[memoKey][1]
                } else {
                    minScoreIndex = getMinIndex(scores)
                    choice = moves[minScoreIndex]
                    memo[memoKey]=[choice,(scores[minScoreIndex]+scores.reduce((a, b) => a + b,0) / scores.length**3)*0.9]
                    return memo[memoKey][1]

                }
            } else {
                choice = memo[memoKey][0]
                // console.log(Object.keys(memo).length)
                return memo[memoKey][1]
            }
        }
    }

    const initGameState = getGameState()
    const initPlayerIndex = turnIndex 
    const initPlayer = playersPlaying[turnIndex]
    let choice
    getMove(initGameState,initPlayerIndex)
    console.log(choice)
    loadGameState(initGameState,initPlayerIndex)
    move(playersPlaying[turnIndex],choice)
}


const createBots = () => {
    const symbol = 'x'
    const botList = {}
    botList['Philip']=(new Player('Philip',symbol,`img/${symbol}.png`,true,0))
    botList['Laika']=(new Player('Laika',symbol,`img/${symbol}.png`,true,7))
    botList['Burke']=(new Player('Burke',symbol,`img/${symbol}.png`,true,13))
    
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
    const leftPlayer = playersPlaying[0]
    const rightPlayer = playersPlaying[1]
    const leftimg = leftPlayer.avatar
    const rightimg = rightPlayer.avatar
    const leftName = leftPlayer.name + (leftPlayer.isComputer ? ' <span class = medium>(Computer)</p>' : '')
    const rightName = rightPlayer.name + (rightPlayer.isComputer ? ' <span class = medium>(Computer)</p>' : '')
    const leftDifficultyDescription = leftPlayer.difficulty < 4 ? 'Novice' : leftPlayer.difficulty < 9 ? 'Intermediate' : 'Undefeatable'
    const rightDifficultyDescription = rightPlayer.difficulty < 4 ? 'Novice' : rightPlayer.difficulty < 9 ? 'Intermediate' : 'Undefeatable'
    const leftCatchPhrase = leftPlayer.catchPhrase
    const rightCatchPhrase = rightPlayer.catchPhrase
    const leftScore = leftPlayer.score
    const rightScore = rightPlayer.score

    let leftRecord = leftPlayer.record[rightPlayer.name]
    let rightRecord = rightPlayer.record[leftPlayer.name]
    console.log(rightPlayer.name)
    console.log(rightPlayer.record)
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
    console.log(winner.record[loser.name])
    console.log(winner)
    console.log(loser)
}


const savePlayerData = () => {
    let playerData={}
    for (p of Player.instances) {
        playerData[p.name]=p
    }
    stringPlayerData = JSON.stringify(playerData)
    storage.setItem('playerData',stringPlayerData)
    console.log('playerData Saved')
}


const loadPlayerData = () => {
    const data = storage.getItem('playerData')
    const dataObject = JSON.parse(data)
    const defulatNames = ['Philip','Laika','Player 1','Player 2','Burke']
    const customPlayers = {}
    for (let playerKey in dataObject) {
        let loadedPlayer=dataObject[playerKey]
        if (defulatNames.includes(loadedPlayer.name)) {
            //find a reference to the existing player instance to edit it.
            for (i of Player.instances) {
                if (i.name === loadedPlayer.name) {
                    i.record=loadedPlayer.record
                    console.log(`${i.name} loaded record`,loadedPlayer.record)
                }
            }
            //now update the records for each default player


        } else {
            //create new player instance of custom players 
            let p = loadedPlayer
            let reloadedCustom = new Player(p.name,p.symbol,p.symbolRef,p.isComputer,p.difficulty,p.catchPhrase)
            customPlayers[reloadedCustom.name]=reloadedCustom
            console.log(`${p.name} loaded record`)
        }
    }
    return customPlayers
}

//=============================================Game flow=============================================//






//GLOBALS
let storage = localStorage

//create/load player and bot instances 
const leftBots = createBots()
const rightBots = createBots() //legacy shit that I dont wanna fix so making two set of bots

const defaultLeft = new Player('Player 1','x','img/x.png',false,100,'Time to tic some tacs')
const defaultRight = new Player('Player 2','o','img/o.png',false,100,'1, 2, 3, 4, something something -AK')

// loadCustomPlayers() make this function. also need a save custom players. Trigger on win (to update record), and on create.

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

generateBoard(size)

const customPlayers = loadPlayerData()
console.log('custom players')
console.log(customPlayers)


savePlayerData()
updatePlayerPanels()


//EVENT LISTENERS



//generate board of size, default 3
document.getElementById('sizeInput').addEventListener('click',(e)=>{
    let newSize = document.getElementById('sizeInput').value
    if (size!==newSize) {
        size=newSize
        if (size>1) {
            memo = {}
            turnIndex = 0
            generateBoard(size)
        }
    }
})


document.querySelector('#continue').addEventListener('click',()=>{
    const overlay = document.querySelector('.outcomeOverlay')
    const content = document.querySelector('.content')
    overlay.classList.toggle('showOutcome')
    content.classList.toggle('hideBoard')
    generateBoard(size)
})





const leftBotSwitch = document.querySelector('#leftPanel input[type="checkbox"')
const rightBotSwitch = document.querySelector('#rightPanel input[type="checkbox"')
const leftBotSelect = document.querySelector('#leftBotList')
const rightBotSelect = document.querySelector('#rightBotList')


leftBotSwitch.addEventListener('click',(e)=>{
    leftBotSelect.classList.toggle('vis')
    if (leftBotSwitch.checked) {
        //means we are adding a bot
        const botName = leftBotSelect.value
        const leftPlayer = leftBots[botName]
        console.log(leftPlayer)
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
        console.log(rightPlayer)
        updatePlayers(playersPlaying[0],rightPlayer) //retain Right hand player (players[1])

    } else {
        updatePlayers(playersPlaying[0],defaultRight)//NEED TO UPDATE THIS FOR CUSTOM PLAYERS INSTEAD OF DEFAULT ONLY
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
