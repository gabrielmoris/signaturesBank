(function () {
    const canv = document.getElementById("canv");
    const signature = document.getElementById("sign");
    let context = canv.getContext("2d");
    let dataURL;
    let isSigning = false;
    const canvPosX = canv.offsetLeft;
    const canvPosY = canv.offsetTop;
    // const canvPosX = canv.offsetLeft - canv.offsetWidth / 10;
    // const canvPosY = canv.offsetTop + canv.offsetHeight / 3;

    let xpos = 0;
    let ypos = 0;

    function signing(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = 2;
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
    //Touchscreen-----------------------------------------------------REVISE
    canv.addEventListener("touchstart", (e) => {
        e.preventDefault();
        // console.log(e);
        xpos = e.touches[0].pageX - canvPosX;
        ypos = e.touches[0].pageY - canvPosY;
        isSigning = true;
    });

    canv.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (isSigning === true) {
            signing(
                context,
                xpos,
                ypos,
                e.touches[0].pageX - canvPosX,
                e.touches[0].pageY - canvPosY
            );
            xpos = e.touches[0].pageX - canvPosX;
            ypos = e.touches[0].pageY - canvPosY;
        }
    });

    canv.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (isSigning === true) {
            // signing(
            //     context,
            //     xpos,
            //     ypos,
            //     e.touches[0].screenX - canvPosX,
            //     e.touches[0].screenY - canvPosY
            // );
            xpos = 0;
            ypos = 0;
            isSigning = false;
            dataURL = canv.toDataURL();
            signature.value = dataURL;
        }
    });
})();
