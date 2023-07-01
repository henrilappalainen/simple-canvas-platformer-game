import _ from 'lodash'
import './style.css'

// ### Model
// Pohja
const base = {
  peli: null,
  board: [640, 480],
}

// Kentät
const kentat = [
  [50, 400],
  [200, 100],
  [50, 400],
  [150, 100],
  [50, 600],
  [100, 100],
  [20, 700],
  [100, 100],
]

// Yksittäinen peli
function Peli() {
  this.hahmo = new Ukkeli()
  this.jatkuu = true
  this.tasot = []
  this.nopeus = 3

  // Muodosta tasot
  let xKohta = 0

  kentat.forEach(kentta => {
    this.tasot.push(new Taso(xKohta, kentta[0], kentta[1], 10))
    xKohta += kentta[1]
  })
}
// Ukkeli
function Ukkeli() {
  this.x = 100
  this.y = base.board[1] - 200
  this.vauhti = 0
  this.leve = 20
  this.kork = 60
}
// Taso
function Taso(x, y, leve, kork) {
  this.x = x
  this.y = base.board[1] - y
  this.leve = leve
  this.kork = kork
}

// ### Controller
// Init game
function initGame() {
  base.peli = new Peli()
  base.peli.tasot

  console.log('peli', base.peli)

  peliSilmukka()
}

function peliSilmukka() {
  let previousTimeStamp;

  function step(timeStamp) {
    ctx.fillStyle = 'cornflowerblue'
    ctx.fillRect(0, 0, base.board[0], base.board[1])
    ctx.save()

    tulosta()
    ctx.restore()
  
    // Stop the animation after 2 seconds
    previousTimeStamp = timeStamp

    if (base.peli && base.peli.jatkuu) window.requestAnimationFrame(step)
  }
  
  window.requestAnimationFrame(step)
}

function tulosta() {
  // Hahmo
  const hahmo = base.peli.hahmo
  const onTasolla = tsekkaaOnkoTasolla(hahmo)

  if (onTasolla) {
    if (hahmo.vauhti > 0) hahmo.vauhti = 0
  } else {
    if (hahmo.vauhti < 10) hahmo.vauhti += .4
  }

  hahmo.y += hahmo.vauhti

  // Tasojen liikuttaminen
  liikutaTasoja()

  // Render hahmo
  ctx.fillStyle = 'tomato'
  ctx.fillRect(hahmo.x, hahmo.y, hahmo.leve, hahmo.kork)

  // Render platform
  base.peli.tasot.forEach(taso => {
    ctx.fillStyle = 'sienna'
    ctx.fillRect(taso.x, taso.y, taso.leve, taso.kork)
  })
}

function liikutaTasoja() {
  base.peli.tasot.forEach(taso => taso.x -= base.peli.nopeus)
}

function tsekkaaOnkoTasolla(hahmo) {
  const positioY = hahmo.y + hahmo.kork

  const osuuJalkoihin = base.peli.tasot.find(taso => {
    // Eikö taso oo ukon kohalla
    if (hahmo.x > taso.x + taso.leve || hahmo.x + hahmo.leve < taso.x) return false
    // Eikö ukon jalat oo tason kohalla
    if (positioY < taso.y || positioY > taso.y + 20) return false
    // Sitten on tasolla
    return true
  })

  return osuuJalkoihin
}

function hyppaa() {
  if (!base.peli) return null

  if (tsekkaaOnkoTasolla(base.peli.hahmo)) base.peli.hahmo.vauhti = -15
}

// ### View
const appContainer = document.createElement('div')
appContainer.classList.add('peli-container')
document.body.appendChild(appContainer)

const canvas = document.createElement('canvas')
canvas.width = base.board[0]
canvas.height = base.board[1]
appContainer.appendChild(canvas)
const ctx = canvas.getContext("2d");

const painikkeidenLaatikko = document.createElement('div')
painikkeidenLaatikko.classList.add('painikkeiden-laatikko')
appContainer.appendChild(painikkeidenLaatikko)

const jumpButton = document.createElement('button')
jumpButton.innerHTML = 'Hyppää!'
jumpButton.addEventListener('click', () => hyppaa() )
painikkeidenLaatikko.appendChild(jumpButton)

const exitButton = document.createElement('button')
exitButton.innerHTML = 'Lopeta peli'
exitButton.addEventListener('click', () => base.peli.jatkuu = false )
painikkeidenLaatikko.appendChild(exitButton)

initGame()
