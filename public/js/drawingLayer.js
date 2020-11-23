const canvas = document.getElementById("drawing_renderer")
const pdf = document.getElementById("pdf_renderer")

const ctx = canvas.getContext('2d')
const ctx2 = canvas.getContext('2d')

//this is not very optimized but it's the only way I've found at the moment to make it work
pdf.addEventListener("mousemove", ()=>{
    resizeCanvas()
})

canvas.addEventListener("mousemove", function(e) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cRect = canvas.getBoundingClientRect();        // Gets CSS pos, and width/height
    const canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
    const canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // (0,0) the top left of the canvas
    ctx.fillText("X: "+canvasX / canvas.width+", Y: "+canvasY / canvas.height, 10, 20);
    ctx.fillRect(canvasX,canvasY,20,20)

    const posX = canvasX / canvas.width
    const posY = canvasY / canvas.height
    sendDataToOthers("pointerPosition," + posX + "," + posY)
});



function drawPointer(posX, posY){
    resizeCanvas()
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // (0,0) the top left of the canvas
    ctx.fillText("X: "+posX+", Y: "+posX, 10, 20);
    ctx.fillRect(posX * canvas.width, posY * canvas.height,20,20)
}

function resizeCanvas(){
    canvas.width = pdf.width
    canvas.height = pdf.height
}

