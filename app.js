
const gamesBoardContainer=document.querySelector('#gamesboard-container')
const optioncontainer=document.querySelector('.option-container')
const flipbutton=document.querySelector('#flip-button')
const startbutton=document.querySelector('#Start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')

//option ships
let angle=0
function flip(){
const optionships=Array.from(optioncontainer.children)
// if(angle==0){
//     angle=90
// }
// else{
//     angle=0
// }
angle=angle===0?90:0
optionships.forEach(optionship =>optionship.style.transform = `rotate(${angle}deg)`)
}
flipbutton.addEventListener('click',flip)

//create boards
const width=10
function createboard(color,user){
    const gameboardcontainer = document.createElement('div')
    gameboardcontainer.classList.add('game-board')
    gameboardcontainer.style.backgroundColor=color
    gameboardcontainer.id = user

    for(let i=0;i<width*width;i++){
        const block = document.createElement('div')
        block.classList.add('block')
        block.id=i
        gameboardcontainer.append(block)
    }

    gamesBoardContainer.append(gameboardcontainer)
}
createboard('#3E5151','player')
createboard('#DECBA4','computer')

//creating ships
class ship{
    constructor(name,length){
        this.name=name
        this.length=length
    }
}

const destroyer = new ship('destroyer',2)
const submarine = new ship('submarine',3)
const crusier = new ship('crusier',3)
const battelship = new ship('battelship',4)
const carrier = new ship('carrier',5)

const ships=[destroyer,submarine,crusier,battelship,carrier]
let notDropped

function handlevalidity(allBoardBlocks,isHorizontal,startIndex,ship){
    let validStart = isHorizontal ? startIndex <= width *width -ship.length ? startIndex : width*width-ship.length:
    //handle vertical
    startIndex <= width *width - width*ship.length ? startIndex:startIndex-ship.length *width + width

   let shipBlocks = []

   for(let i=0;i<ship.length;i++){
    if(isHorizontal){
        shipBlocks.push(allBoardBlocks[Number(validStart)+i])
    }else{
        shipBlocks.push(allBoardBlocks[Number(validStart)+i*width])
    }
   }

   let valid
   if(isHorizontal){
    shipBlocks.every((_shipBlock,index) =>
        valid=shipBlocks[0].id % width !== width -(shipBlocks.length - (index + 1)))
   }else{
    shipBlocks.every((_shipBlock,index) => 
        valid= shipBlocks[0].id <90 + (width * index+1))
   }

   const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

   return {shipBlocks,valid,notTaken}
}

function addShipPiece(user,ship,startId){
   const allBoardBlocks = document.querySelectorAll(`#${user} div`)
   let randomBoolean = Math.random()<0.5
   let isHorizontal = user==='player'? angle===0: randomBoolean
   let randomStartIndex = Math.floor(Math.random() * width * width)

    let startIndex = startId?startId:randomStartIndex

   const {shipBlocks,valid,notTaken} = handlevalidity(allBoardBlocks,isHorizontal,startIndex,ship)
   
   if(valid && notTaken){
    shipBlocks.forEach(shipBlock =>{
        shipBlock.classList.add(ship.name)
        shipBlock.classList.add('taken')
       })
   }else{
    if(user=== 'computer')addShipPiece(user,ship,startId)
    if(user === 'player')notDropped = true
   }
}
ships.forEach(ship => addShipPiece('computer',ship))

//drag player ships
let draggedShip
const optionships = Array.from(optioncontainer.children)
optionships.forEach(optionship => optionship.addEventListener('dragstart',dragstart))

const allplayerBlocks = document.querySelectorAll('#player div')

allplayerBlocks.forEach(playerBlock =>{
    playerBlock.addEventListener('dragover',dragOver)
    playerBlock.addEventListener('drop',dropShip)
})
function dragstart(e){
    notDropped =false
    draggedShip = e.target
}

function dragOver(e){
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlight(e.target.id,ship)
}

function dropShip(e){
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player',ship,startId)
    if(!notDropped){
        draggedShip.remove()
    }
}

//add highlight
function highlight(startIndex,ship){
    const allBoardBlocks=document.querySelectorAll('#player div')
    let isHorizontal = angle ===0

    const {shipBlocks,valid,notTaken} = handlevalidity(allBoardBlocks,isHorizontal,startIndex,ship)
    if(valid && notTaken){
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout(() => shipBlock.classList.remove('hover'),500)
        })
    }
}

let gameOver =false
let playerTurn 

//Start Game
function startGame(){
    if(playerTurn == undefined){
        if(optioncontainer.children.length !=0){
            infoDisplay.textContent='Please place all your pieces first!'
        }else{
            const allBoardBlocks=document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block =>block.addEventListener('click',handleClick))
            playerTurn = true
        turnDisplay.textContent = 'Your Go!'
        infoDisplay.textContent = 'The game has started!'
        }
        
    }
   
}
startbutton.addEventListener('click',startGame)

let playerhits=[]
let computerhits =[]
const playerSunkShips =[]
const computerSunkShips = []

function handleClick(e){
    if(!gameOver){
        if(e.target.classList.contains('taken')){
            e.target.classList.add('boom')
            infoDisplay.textContent ="you hit this computer ship!"
            let classes=Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerhits.push(...classes)
            checkScore('player',playerhits,playerSunkShips)

        }
        if(!e.target.classList.contains('taken')){
        infoDisplay.textContent = 'Nothing hit this time'
        e.target.classList.add('empty')
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo,3000)
    }
}

//define the computer go
function computerGo(){
    if(!gameOver){
        turnDisplay.textContent = 'Computer Go!'
        infoDisplay.textContent = 'the computer is thinking....!'

        setTimeout(() =>{
            let randomGo = Math.floor(Math.random()*width*width)
            const allBoardBlocks = document.querySelectorAll('#player div')

            if(allBoardBlocks[randomGo].classList.contains('taken')&& allBoardBlocks[randomGo].classList.contains('boom')){
                computerGo()
                return
            }else if(allBoardBlocks[randomGo].classList.contains('taken')&& !allBoardBlocks[randomGo].classList.contains('boom')){
                allBoardBlocks[randomGo].classList.add('boom')
                infoDisplay.textContent = 'The computer hit your ship!'
                let classes=Array.from(allBoardBlocks[randomGo].classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            computerhits.push(...classes)
            checkScore('computer',computerhits,computerSunkShips)
            }else{
                infoDisplay.textContent = 'Nothing hit this time!'
                allBoardBlocks[randomGo].classList.add('empty')
            }
        },3000)
        setTimeout(()=>{
            playerTurn=true
            turnDisplay.textContent = 'your go!'
            infoDisplay.textContent = 'Please take your Go!'
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click',handleClick))
        },6000)
    }
}

function checkScore(user,userHits,UserSunkShips){
    function checkship(shipName,shipLength){
        if(userHits.filter(storedShipName => storedShipName === shipName).length ===shipLength){
           
            if(user === 'player'){
                infoDisplay.textContent =  `you sunk the computers's ${shipName}`
                playerhits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            if(user === 'computer'){
                infoDisplay.textContent =  `The Computer sunk your's ${shipName}`
                computerhits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            UserSunkShips.push(shipName)
        }
    }
    checkship('destroyer',2)
    checkship('submarine',3)
    checkship('crusier',3)
    checkship('battelship',4)
    checkship('carrier',5)

    if(playerSunkShips.length === 5){
        infoDisplay.textContent = 'You sunk all the computers ships. You own!'
        gameOver=true
    }
    if(computerSunkShips.length === 5){
        infoDisplay.textContent = 'The computer has sunk all your ships. You LOST!'
        gameOver=true
    }
}