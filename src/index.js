import _ from 'lodash'
import './style.css'

// ### Model
// Pohja
const base = {
  peli: null,
  board: [640, 480],
  aloita: function () {
    // Nollaa peli jos se on jo käynnissä
    if (this.peli) this.peli = null

    this.peli = new Peli()
    paivitaPainikkeet(2)
    peliSilmukka()
  },
  lopeta: function () {
    this.peli.jatkuu = false
    paivitaPainikkeet(1)
  },
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
  this.matka = 0

  // Muodosta tasot
  this.xKohta = 0

  kentat.forEach(kentta => {
    this.tasot.push(new Taso(this.xKohta, kentta[0], kentta[1], 10))
    this.xKohta += kentta[1]
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

function paivitaPainikkeet(state) {
  // States 1: menu, 2: running, 3: score (otherwise abort)
  if (![1,2,3].includes(state)) return

  if (state === 1) {
    hyppyPainike.remove()
    painikkeidenLaatikko.appendChild(aloitusPainike)
    lopetusPainike.remove()
  } else if (state === 2) {
    painikkeidenLaatikko.appendChild(hyppyPainike)
    aloitusPainike.remove()
    painikkeidenLaatikko.appendChild(lopetusPainike)
  } else {
    hyppyPainike.remove()
    lopetusPainike.remove()
    painikkeidenLaatikko.appendChild(aloitusPainike)
  }
}

function peliSilmukka() {
  ctx.fillStyle = 'cornflowerblue'
  ctx.fillRect(0, 0, base.board[0], base.board[1])
  ctx.save()

  base.peli.matka += base.peli.nopeus

  // Hahmo
  const hahmo = base.peli.hahmo
  const onTasolla = tsekkaaOnkoTasolla(hahmo)

  if (onTasolla) {
    if (hahmo.vauhti > 0) hahmo.vauhti = 0
  } else {
    if (hahmo.vauhti < 10) hahmo.vauhti += .4
  }

  hahmo.y += hahmo.vauhti

  if ((hahmo.y + hahmo.kork) > base.board[1]) base.lopeta()

  // Tasojen liikuttaminen
  liikutaTasoja()

  tulosta()
  ctx.restore()

  if (base.peli && base.peli.jatkuu) window.requestAnimationFrame(peliSilmukka)
  else lopetaPeli()
}

function lopetaPeli() {
  ctx.clearRect(0, 0, base.board[0], base.board[1]);
  console.log('base', base)

  ctx.font = '72px serif'
  ctx.textAlign = 'center'
  ctx.fillText('pisteet ' + base.peli.matka, base.board[0] / 2, base.board[1] / 2, base.board[0] - 20)
}

function tulosta() {
  const hahmo = base.peli.hahmo

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
const ctx = canvas.getContext("2d")

const painikkeidenLaatikko = document.createElement('div')
painikkeidenLaatikko.classList.add('painikkeiden-laatikko')
appContainer.appendChild(painikkeidenLaatikko)

const hyppyPainike = document.createElement('button')
hyppyPainike.innerHTML = 'Hyppää!'
hyppyPainike.addEventListener('click', () => hyppaa() )

const aloitusPainike = document.createElement('button')
aloitusPainike.innerHTML = 'Aloita peli'
aloitusPainike.addEventListener('click', () => base.aloita() )

const lopetusPainike = document.createElement('button')
lopetusPainike.innerHTML = 'Lopeta peli'
lopetusPainike.addEventListener('click', () => base.lopeta() )

paivitaPainikkeet(1)