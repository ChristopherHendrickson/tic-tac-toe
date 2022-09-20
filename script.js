class Player {
    constructor(name,symbol,symbolRef,isComputer,difficulty=9) {
        this.name = name
        this.symbol = symbol
        this.symbolRef = symbolRef
        this.audio = new Audio(`aud/${symbol}.mp3`)
        this.audio.volume = 0.4
        this.isComputer = isComputer
        this.difficulty = difficulty
        this.score = 0
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
        const listenerFunction = ()=>{
            console.log('=================================')
            // console.log(players[turnIndex].isComputer)
            let result
            if (!players[turnIndex].isComputer) {
                result = move(players[turnIndex],this)
            }
            if (result!=='win') {
                if (players[turnIndex].isComputer) {
                    setTimeout(computerMove,0)
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

    for (let row=0;row<size;row++) {
        winLines.winRows[row]=[]
    }
    for (let col=0;col<size;col++) {
        winLines.winCols[col]=[]
    }
    //always only 2 diag win lines
    winLines.winDiags.left=[]
    winLines.winDiags.right=[]
    //add nodes to the win line lists
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
        turnIndex = Math.abs(turnIndex-1) //bounces between 1 and 0
        const result = checkWin(player,node)
        if (result === 'win') {
            showWin(player,node)
            return result
        }
        if (result ==='draw') {
            showDraw()
            return result
        }

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
            if (player===players[initPlayerIndex]) {
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
                maxIndex = Math.random()>Math.random() ? maxIndex : count
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
                minIndex = Math.random()>Math.random() ? minIndex : count
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
                const currentPlayer = players[playerState]
                for (let i = 0; i < nodeList.length ; i++) {
                    loadGameState(gameState,playerState)
                    let node = nodeList[i]
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
                if (currentPlayer===players[initPlayerIndex]) {
                    maxScoreIndex = getMaxIndex(scores)
                    choice = moves[maxScoreIndex]
                    memo[memoKey]=[choice,scores[maxScoreIndex]]
                    return (memo[memoKey][1]+scores.reduce((a, b) => a + b) / scores.length**2)*0.9
                } else {
                    minScoreIndex = getMinIndex(scores)
                    choice = moves[minScoreIndex]
                    memo[memoKey]=[choice,scores[minScoreIndex]]
                    return (memo[memoKey][1]+scores.reduce((a, b) => a + b) / scores.length**2)*0.9
                }
            } else {
                choice = memo[memoKey][0]
                // console.log(Object.keys(memo).length)
                return memo[memoKey][1]*0.9
            }
        }
    }

    const initGameState = getGameState()
    const initPlayerIndex = turnIndex 
    const initPlayer = players[turnIndex]
    let choice
    getMove(initGameState,initPlayerIndex)
    console.log(choice)
    loadGameState(initGameState,initPlayerIndex)
    console.log(turnIndex)
    console.log(players[turnIndex].name)
    move(players[turnIndex],choice)
}


const createBots = (side) => {
    const symbol = side === 'left' ? 'x':'o'
    const botList = []
    botList.push(new Player('Philip',symbol,`img/${symbol}.png`,true,0))
    botList.push(new Player('Laika',symbol,`img/${symbol}.png`,true,5))
    botList.push(new Player('Burke',symbol,`img/${symbol}.png`,true,13))
    
    const htmlSelect = document.querySelector(`#${side}BotList`)
    let htmlOptions = ''
    for (let i = 0; i<botList.length ; i++) {
        htmlOptions+=`<option id="${botList[i].name}">${botList[i].name}</option>`
    }
    htmlSelect.innerHTML=htmlOptions
    return botList
}


const updatePlayers = (player0,player1) => {
    players[0]=player0
    players[1]=player1
}

//=============================================Game flow=============================================//






//GLOBALS

const leftBots = createBots('left')
const rightBots = createBots('right')

// <option value="bot1">bot1</option>



let players = {
    0:new Player('jack','x','img/x.png',false,4),
    1:new Player('jill','o','img/o.png',true,13)
}

updatePlayers(leftBots[0],rightBots[2])

let turnIndex = 0
let nodeList= []
let winLines = {
    winRows: {},
    winCols: {},
    winDiags: {},
}
let size=3
let memo = {}
generateBoard(size)


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
const leftBotList = document.querySelector('#leftBotList')
const rightBotList = document.querySelector('#rightBotList')

leftBotSwitch.addEventListener('click',(e)=>{
    leftBotList.classList.toggle('vis')
})

rightBotSwitch.addEventListener('click',(e)=>{
    rightBotList.classList.toggle('vis')
})

leftBotList.addEventListener('click',(e)=>{
    console.log(e.target)
    console.log(e.currentTarget)
    console.log(e.target.value)
})


