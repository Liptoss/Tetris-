const elements = {
    "Air": {},
    "Eau": {},
    "Feu": {},
    "Terre": {}
}

const recipes = {
    "Air+Eau": "Pluie",
    "Air+Feu": "Energie",
    "Air+Terre": "Poussiere",

    "Eau+Feu": "Vapeur",
    "Eau+Terre": "Boue",

    "Feu+Terre": "Lave",

    "Lave+Air": "Pierre",
    "Pierre+Feu": "Metal",

    "Metal+Feu": "Acier",

    "Eau+Air": "Pluie",

    "Pluie+Terre": "Plante",

    "Plante+Feu": "Cendre",

    "Plante+Eau": "Algue"
}

let discovered = ["Air","Eau","Feu","Terre"]

let slot1 = null
let slot2 = null

let score = 0

function renderElements(){

const container = document.getElementById("elements")
container.innerHTML=""

discovered.forEach(e=>{

let div = document.createElement("div")
div.className="element"
div.innerText=e

div.onclick=()=>selectElement(e)

container.appendChild(div)

})

}

function selectElement(name){

if(!slot1){
slot1=name
document.getElementById("slot1").innerText=name
return
}

if(!slot2){
slot2=name
document.getElementById("slot2").innerText=name
combine()
}

}

function combine(){

let key = slot1+"+"+slot2
let key2 = slot2+"+"+slot1

let result = recipes[key] || recipes[key2]

if(result){

document.getElementById("result").innerText="Découverte : "+result

if(!discovered.includes(result)){

discovered.push(result)

score += discovered.length * 10

}

}else{

document.getElementById("result").innerText="Rien ne se passe..."

}

slot1=null
slot2=null

document.getElementById("slot1").innerText=""
document.getElementById("slot2").innerText=""

renderElements()

}

renderElements()
