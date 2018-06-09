//Thanks to Makallus on https://stackoverflow.com/questions/8974364/how-can-i-draw-a-text-along-arc-path-with-html-5-canvas


function fillRibbon(canvasContext, text, hasStroke, inputRibbon)
{
    var textCurve = [];
    var ribbon = text.substring(0, inputRibbon.maxChar);
    var curveSample = 1000;


    xDist = 0;
    var i = 0;
    for (i = 0; i < curveSample; i++) {
        a = new bezier2(i / curveSample, inputRibbon.startX, inputRibbon.startY, inputRibbon.control1X, inputRibbon.control1Y, inputRibbon.control2X, inputRibbon.control2Y, inputRibbon.endX, inputRibbon.endY);
        b = new bezier2((i + 1) / curveSample, inputRibbon.startX, inputRibbon.startY, inputRibbon.control1X, inputRibbon.control1Y, inputRibbon.control2X, inputRibbon.control2Y, inputRibbon.endX, inputRibbon.endY);
        c = new bezier(a, b);
        textCurve.push({
            bezier: a,
            curve: c.curve
        });
    }

    letterPadding = canvasContext.measureText(" ").width / 4;
    w = ribbon.length;
    ww = Math.round(canvasContext.measureText(ribbon).width);


    totalPadding = (w - 1) * letterPadding;
    totalLength = ww + totalPadding;
    p = 0;

    cDist = textCurve[curveSample - 1].curve.cDist;

    z = (cDist / 2) - (totalLength / 2);

    for (i = 0; i < curveSample; i++) {
        if (textCurve[i].curve.cDist >= z) {
            p = i;
            break;
        }
    }

    for (i = 0; i < w; i++) {
        canvasContext.save();
        canvasContext.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y);
        canvasContext.rotate(textCurve[p].curve.rad);
        
        if(hasStroke)
        {
            canvasContext.strokeText(ribbon[i], 0, 0);
        }
        
        canvasContext.fillText(ribbon[i], 0, 0);
        canvasContext.restore();

        x1 = canvasContext.measureText(ribbon[i]).width + letterPadding;
        x2 = 0;
        for (j = p; j < curveSample; j++) {
            x2 = x2 + textCurve[j].curve.dist;
            if (x2 >= x1) {
                p = j;
                break;
            }
        }
    }
} //end FillRibon

function bezier(b1, b2)
{
    //Final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance
    this.rad = Math.atan(b1.point.mY / b1.point.mX);
    this.b2 = b2;
    this.b1 = b1;
    dx = (b2.x - b1.x);
    dx2 = (b2.x - b1.x) * (b2.x - b1.x);
    this.dist = Math.sqrt(((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)));
    xDist = xDist + this.dist;
    this.curve = {
        rad: this.rad,
        dist: this.dist,
        cDist: xDist
    };
}

function bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY)
{
    //calculates the tangent line to a point in the curve; later used to calculate the degrees of rotation at this point.
    this.mx = (3 * (1 - t) * (1 - t) * (control1X - startX)) + ((6 * (1 - t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X));
    this.my = (3 * (1 - t) * (1 - t) * (control1Y - startY)) + ((6 * (1 - t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y));
}

function bezier2(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY)
{
    //Quadratic bezier curve plotter
    this.Bezier1 = new bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y);
    this.Bezier2 = new bezier1(t, control1X, control1Y, control2X, control2Y, endX, endY);
    this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x);
    this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y);
    this.slope = new bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);

    this.point = {
        t: t,
        x: this.x,
        y: this.y,
        mX: this.slope.mx,
        mY: this.slope.my
    };
}

function bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y)
{
    //linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
    this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X);
    this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y);

}
