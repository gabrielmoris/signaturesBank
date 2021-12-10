(function () {
    const canv = document.getElementById("canv");
    const signature = document.getElementById("sign");
    let context = canv.getContext("2d");
    let dataURL;
    let isSigning = false;
    let xpos = 0;
    let ypos = 0;

    function signing(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }

    canv.addEventListener("mousedown", (e) => {
        xpos = e.offsetX;
        ypos = e.offsetY;
        isSigning = true;
        // console.log(xpos, ypos)
    });

    canv.addEventListener("mousemove", (e) => {
        if (isSigning === true) {
            signing(context, xpos, ypos, e.offsetX, e.offsetY);
            xpos = e.offsetX;
            ypos = e.offsetY;
        }
    });
    window.addEventListener("mouseup", (e) => {
        if (isSigning === true) {
            signing(context, xpos, ypos, e.offsetX, e.offsetY);
            xpos = 0;
            ypos = 0;
            isSigning = false;
            dataURL = canv.toDataURL();
            signature.value = dataURL;
        }
    });
})();
