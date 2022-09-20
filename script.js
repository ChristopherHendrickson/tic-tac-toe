class Player {
    constructor(name,symbol,symbolRef,isComputer) {
        this.name = name
        this.symbol = symbol
        this.symbolRef = symbolRef
        this.audio = new Audio(`aud/${symbol}.mp3`)
        this.audio.volume = 0.4
        this.isComputer = isComputer
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

        nodeDiv.addEventListener('click',()=>{
            console.log('=================================')
            // console.log(players[turnIndex].isComputer)
            if (!players[turnIndex].isComputer) {
                move(players[turnIndex],this)
            }
            if (players[turnIndex].isComputer) {
                setTimeout(computerMove,500)
            }
        })

    }
}



const generateBoard = (size=3) => {
    
    //adjust board grid to fit all the squares
    const board = document.querySelector('.board')
    board.innerHTML=''
    frString = '1fr '.repeat(size)
    nodeList=[]
    board.style.gridTemplateColumns = frString
    board.style.gridTemplateRows = frString

    //add lits to the winLines to for all rows and cols
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
        if (checkWin(player,node)==='win') {
            showWin(player,node)
        }
        if (checkWin(player,node)==='draw') {
            showDraw()
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
    const overlay = document.querySelector('.outcomeOverlay')
    const content = document.querySelector('.content')
    overlay.classList.toggle('showOutcome')
    content.classList.toggle('hideBoard')
    document.querySelector('#continue').style.display='inline-block'
}

const showDraw = () => {
    showWin(1,1)
}



//=============================================Game flow=============================================//

let players=[new Player('jack','x','img/x.png',false),new Player('jill','o','img/o.png',true)] //add players to this
let turnIndex = 0
let nodeList= []
let winLines = {
    winRows: {},
    winCols: {},
    winDiags: {},
}
let size=3
let memo = {}
generateBoard(size)//generates on load



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
})





const computerMove = () => {

    computerSymbol = players[turnIndex].symbol
    
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
            if (player===players[initPlayerState]) {
                return 10
            } else {
                return -10
            }
        } else if (checkWin(player,node)==='draw') {
            return 1 
        } else {
            return 0
        }
    }
    
    const getMaxIndex = (arr) => {
        let maxIndex = 0
        let max = -Infinity
        let count=0
        arr.forEach((e) => {
            if (e>=max) {
                max=e
                maxIndex=count
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
            if (e<=min) {
                min=e
                minIndex=count
            }
            count++
        })
        return minIndex
    }

    const getMove = (gameState,playerState) => {
        let memoKey = ''
        gameState.forEach((e)=> {
            memoKey+=e
        })
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
                        choice = node //catches the case where only one move is possible
                        memo[memoKey]=[choice,getScore(currentPlayer,node)]
                        
                        return getScore(currentPlayer,node)
                    }
    
                    moves.push(node) 
                    scores.push(getMove(getGameState(),Math.abs(playerState-1)))
                } 
            } 
            if (currentPlayer===players[initPlayerState]) {
                maxScoreIndex = getMaxIndex(scores)
                choice = moves[maxScoreIndex]
                memo[memoKey]=[choice,scores[maxScoreIndex]]
                return memo[memoKey][1]
            } else {
                minScoreIndex = getMinIndex(scores)
                choice = moves[minScoreIndex]
                memo[memoKey]=[choice,scores[minScoreIndex]]
                return memo[memoKey][1]
            }
        } else {
            choice = memo[memoKey][0]
            console.log(Object.keys(memo).length)
            return memo[memoKey][1]
        }

    }

    const initGameState = getGameState()
    const initPlayerState = turnIndex 
    let choice
    getMove(initGameState,initPlayerState)
    loadGameState(initGameState,initPlayerState)
    move(players[turnIndex],choice)
}





