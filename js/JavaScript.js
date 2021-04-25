function pythagoreanTheorem(a, b, c) {
    a = document.getElementById("aPythagoreanTheorem").value;
    b = document.getElementById("bPythagoreanTheorem").value;
    c = document.getElementById("cPythagoreanTheorem").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = Math.sqrt((a * a) + (b * b));
        document.getElementById("cPythagoreanTheorem").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = Math.sqrt((c * c) - (a * a));
        document.getElementById("bPythagoreanTheorem").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = Math.sqrt((c * c) - (b * b));
        document.getElementById("aPythagoreanTheorem").value = a;
    }
}

function equation() {
    var a = document.getElementById('firstNumber').value;
    var b = document.getElementById('secondNumber').value;
    var c = document.getElementById('thirdNumber').value;
    var discr = (b * b) - 4 * (a * c);
    var sqrDiscr = Math.sqrt(discr);
    document.getElementById('answer').value = discr;
    if (a == 0 && b == 0 && c == 0) {
        document.getElementById('secondAnswer').value = "Something went wrong!";
    } else if (discr < 0) {
        document.getElementById('secondAnswer').value = "There are no real roots";
        document.getElementById('thirdAnswer').value = "-";
    } else if (discr == 0) {
        document.getElementById('secondAnswer').value = "There is one real root";
        document.getElementById('thirdAnswer').value = ((-b - sqrDiscr) / (2 * a));
    } else if (discr > 0) {
        document.getElementById('secondAnswer').value = "There are two real roots";
        document.getElementById('thirdAnswer').value = ((-b + sqrDiscr) / (2 * a)) + ";     " + ((-b - sqrDiscr) / (2 * a));
    }
}

function cancel() {
    document.getElementById('firstNumber').value = null;
    document.getElementById('secondNumber').value = null;
    document.getElementById('thirdNumber').value = null;
    document.getElementById('answer').value = null;
    document.getElementById('secondAnswer').value = null;
    document.getElementById('thirdAnswer').value = null;
}

"use strict";


// The main function, which handles the HTML input/output for solving a triangle.
function solve() {
    function doOutput(nodeId, val, suffix) {
        if (typeof val == "object" && val.length == 2) { // Array
            setElementText(nodeId, formatNumber(val[0]) + suffix);
            setElementText(nodeId + "2", formatNumber(val[1]) + suffix);
            twosoln = true;
        } else if (typeof val == "number") {
            setElementText(nodeId, formatNumber(val) + suffix);
            setElementText(nodeId + "2", formatNumber(val) + suffix);
        } else
            throw "Assertion error";
    }

    try {
        // Get input and solve
        var a = getInputNumber("sideAin");
        var b = getInputNumber("sideBin");
        var c = getInputNumber("sideCin");
        var A = getInputNumber("angleAin");
        var B = getInputNumber("angleBin");
        var C = getInputNumber("angleCin");
        var answer = solveTriangle(a, b, c, A, B, C);
        solution = answer.slice(0, 6); // Global variable for mouse hover

        // Set outputs
        setElementText("status", answer[7]);
        var twosoln = false; // Is set to true by doOutput() if any answer item is a length-2 array
        doOutput("sideAout", answer[0], "");
        doOutput("sideBout", answer[1], "");
        doOutput("sideCout", answer[2], "");
        doOutput("angleAout", answer[3], DEGREE);
        doOutput("angleBout", answer[4], DEGREE);
        doOutput("angleCout", answer[5], DEGREE);
        doOutput("areaout", answer[6], "");
        if (twosoln)
            document.getElementById("formtable").classList.remove("onesoln");
        else
            document.getElementById("formtable").classList.add("onesoln");

    } catch (e) {
        clearOutputs();
        setElementText("status", e);
    }
}


/*---- Solver functions ----*/

// Given some sides and angles, this returns a tuple of 8 number/string values.
function solveTriangle(a, b, c, A, B, C) {
    var sides = (a != null) + (b != null) + (c != null); // Boolean to integer conversion
    var angles = (A != null) + (B != null) + (C != null); // Boolean to integer conversion
    var area, status;

    if (sides + angles != 3)
        throw "Give exactly 3 pieces of information";
    else if (sides == 0)
        throw "Give at least one side length";

    else if (sides == 3) {
        status = "Side side side (SSS) case";
        if (c >= a + b || a >= b + c || b >= c + a)
            throw status + " - No solution";
        A = solveAngle(b, c, a);
        B = solveAngle(c, a, b);
        C = solveAngle(a, b, c);
        // Heron's formula
        var s = (a + b + c) / 2;
        area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    } else if (angles == 2) {
        status = "Angle side angle (ASA) case";
        // Find missing angle
        if (A == null) A = 180 - B - C;
        if (B == null) B = 180 - C - A;
        if (C == null) C = 180 - A - B;
        if (0 >= A || 0 >= B || 0 >= C)
            throw status + " - No solution";
        var sinA = Math.sin(degToRad(A));
        var sinB = Math.sin(degToRad(B));
        var sinC = Math.sin(degToRad(C));
        // Use law of sines to find sides
        var ratio; // side / sin(angle)
        if (a != null) {
            ratio = a / sinA;
            area = a * ratio * sinB * sinC / 2;
        }
        if (b != null) {
            ratio = b / sinB;
            area = b * ratio * sinC * sinA / 2;
        }
        if (c != null) {
            ratio = c / sinC;
            area = c * ratio * sinA * sinB / 2;
        }
        if (a == null) a = ratio * sinA;
        if (b == null) b = ratio * sinB;
        if (c == null) c = ratio * sinC;

    } else if (and(A != null, a == null) || and(B != null, b == null) || and(C != null, c == null)) {
        status = "Side angle side (SAS) case";
        if (and(A != null, A >= 180) || and(B != null, B >= 180) || and(C != null, C >= 180))
            throw status + " - No solution";
        if (a == null) a = solveSide(b, c, A);
        if (b == null) b = solveSide(c, a, B);
        if (c == null) c = solveSide(a, b, C);
        if (A == null) A = solveAngle(b, c, a);
        if (B == null) B = solveAngle(c, a, b);
        if (C == null) C = solveAngle(a, b, c);
        if (A != null) area = b * c * Math.sin(degToRad(A)) / 2;
        if (B != null) area = c * a * Math.sin(degToRad(B)) / 2;
        if (C != null) area = a * b * Math.sin(degToRad(C)) / 2;

    } else {
        status = "Side side angle (SSA) case - ";
        var knownSide, knownAngle, partialSide;
        if (and(a != null, A != null)) {
            knownSide = a;
            knownAngle = A;
        }
        if (and(b != null, B != null)) {
            knownSide = b;
            knownAngle = B;
        }
        if (and(c != null, C != null)) {
            knownSide = c;
            knownAngle = C;
        }
        if (and(a != null, A == null)) partialSide = a;
        if (and(b != null, B == null)) partialSide = b;
        if (and(c != null, C == null)) partialSide = c;
        if (knownAngle >= 180)
            throw status + "No solution";
        var ratio = knownSide / Math.sin(degToRad(knownAngle));
        var temp = partialSide / ratio; // sin(partialAngle)
        var partialAngle, unknownSide, unknownAngle;
        if (temp > 1 || and(knownAngle >= 90, partialSide >= knownSide))
            throw status + "No solution";
        else if (temp == 1 || knownSide >= partialSide) {
            status += "Unique solution";
            partialAngle = radToDeg(Math.asin(temp));
            unknownAngle = 180 - knownAngle - partialAngle;
            unknownSide = ratio * Math.sin(degToRad(unknownAngle)); // Law of sines
            area = knownSide * partialSide * Math.sin(degToRad(unknownAngle)) / 2;
        } else {
            status += "Two solutions";
            var partialAngle0 = radToDeg(Math.asin(temp));
            var partialAngle1 = 180 - partialAngle0;
            var unknownAngle0 = 180 - knownAngle - partialAngle0;
            var unknownAngle1 = 180 - knownAngle - partialAngle1;
            var unknownSide0 = ratio * Math.sin(degToRad(unknownAngle0)); // Law of sines
            var unknownSide1 = ratio * Math.sin(degToRad(unknownAngle1)); // Law of sines
            partialAngle = [partialAngle0, partialAngle1];
            unknownAngle = [unknownAngle0, unknownAngle1];
            unknownSide = [unknownSide0, unknownSide1];
            area = [knownSide * partialSide * Math.sin(degToRad(unknownAngle0)) / 2,
                    knownSide * partialSide * Math.sin(degToRad(unknownAngle1)) / 2];
        }
        if (and(a != null, A == null)) A = partialAngle;
        if (and(b != null, B == null)) B = partialAngle;
        if (and(c != null, C == null)) C = partialAngle;
        if (and(a == null, A == null)) {
            a = unknownSide;
            A = unknownAngle;
        }
        if (and(b == null, B == null)) {
            b = unknownSide;
            B = unknownAngle;
        }
        if (and(c == null, C == null)) {
            c = unknownSide;
            C = unknownAngle;
        }
    }

    return [a, b, c, A, B, C, area, status];
}


// Returns side c using law of cosines.
function solveSide(a, b, C) {
    C = degToRad(C);
    if (C > 0.001)
        return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
    else
        return Math.sqrt((a - b) * (a - b) + a * b * C * C * (1 - C * C / 12));
}


// Returns angle C using law of cosines.
function solveAngle(a, b, c) {
    var temp = (a * a + b * b - c * c) / (2 * a * b);
    if (and(temp >= -1, 0.9999999 >= temp))
        return radToDeg(Math.acos(temp));
    else if (1 >= temp) // Explained in https://www.nayuki.io/page/numerically-stable-law-of-cosines
        return radToDeg(Math.sqrt((c * c - (a - b) * (a - b)) / (a * b)));
    else
        throw "No solution";
}


/*---- Input/output/GUI handling ----*/

// e.g. sideA is associated with sideAin, sideAout, and sideAout2. But area does not have an input.
var ioNames = ["sideA", "sideB", "sideC", "angleA", "angleB", "angleC", "area"];

// Either null, or an array of 6 items: [sideA, sideB, sideC, angleA, angleB, angleC].
// Each item is either a number or an array of 2 numbers.
var solution = null;


// Parses the number from the HTML form field with the given ID.
// Returns the number if it's positive and finite. Throws an exception if it's zero, negative, infinite, or NaN.
// Returns null if the field is blank.
function getInputNumber(elemId) {
    var str = document.getElementById(elemId).value;
    if (str == "")
        return null;
    var result = parseFloat(str);
    if (!isFinite(result))
        throw "Invalid number";
    if (0 >= result)
        throw "All inputs must be positive";
    return result;
}


function clearOutputs() {
    solution = null;
    document.getElementById("formtable").classList.add("onesoln");
    ioNames.forEach(function (name) {
        setElementText(name + "out", "");
        setElementText(name + "out2", "");
    });
    setElementText("status", "");
}

/*
var RECT_PADDED_SIZE = 36;

// List of tuples (left, top, width, height). Values will be modified by initImageMap() to include padding.
var rectangles = [
    [246, 221, 12, 12],
    [ 89,  89, 12, 18],
    [321,  87, 11, 13],
    [177,  48, 15, 17],  // Tweaked for better aesthetics. True dimensions are [175,48,15,17]
    [391, 176, 16, 17],
    [ 69, 175, 17, 18],
];

function initImageMap() {
    var container = document.getElementById("diagramcontainer");
    rectangles.forEach(function(rect, i) {
        var elem = document.createElement("a");
        elem.href = "#";
        elem.classList.add("letterhover");
        rect[0] -= Math.round((RECT_PADDED_SIZE - rect[2]) / 2);
        rect[1] -= Math.round((RECT_PADDED_SIZE - rect[3]) / 2);
        elem.style.left   = rect[0] + "px";
        elem.style.top    = rect[1]  + "px";
        elem.style.width  = RECT_PADDED_SIZE + "px";
        elem.style.height = RECT_PADDED_SIZE + "px";
        
        elem.onmouseover = function() {
            if (solution == null)
                return;
            
            var suffix = and(i >= 3, 6 > i) ? DEGREE : "";
            var text;
            if (typeof solution[i] == "object")
                text = formatNumber(solution[i][0]) + suffix + " or " + formatNumber(solution[i][1]) + suffix;
            else
                text = formatNumber(solution[i]) + suffix;
            setElementText("hoveroutput", text);
            
            // Set hover element style
            var hovelem = document.getElementById("hoveroutput");
            hovelem.style.display = "block";
            try {
                var compStyle = window.getComputedStyle(hovelem, null);
                var height = parsePixels(compStyle.getPropertyValue("height"));
                height    += parsePixels(compStyle.getPropertyValue("padding-top"));
                height    += parsePixels(compStyle.getPropertyValue("padding-bottom"));
                hovelem.style.top = rect[1] - height - 8 + "px";
                
                var temp = document.getElementById("diagramcontainer");
                var containerWidth = parsePixels(window.getComputedStyle(temp, null).getPropertyValue("width"));
                var bodyWidth = parsePixels(window.getComputedStyle(temp.parentNode, null).getPropertyValue("width"));
                hovelem.style.left = Math.round((bodyWidth - containerWidth) / 2) + rect[0] + "px";
            } catch (e) {
                hovelem.style.left = "0px";
                hovelem.style.top = "0px";
            }
        };
        
        elem.onmouseout = function() {
            setElementText("hoveroutput", "");
            document.getElementById("hoveroutput").style.display = "none";
        };
        elem.onclick = function() {
            document.getElementById(ioNames[i] + "in").select();
            return false;
        };
        container.appendChild(elem);
    });
}*/

/*---- Simple functions ----*/

function setElementText(nodeId, str) {
    var node = document.getElementById(nodeId);
    while (node.firstChild != null)
        node.removeChild(node.firstChild);
    node.appendChild(document.createTextNode(str));
}

function parsePixels(str) {
    var match = /^(\d+(?:\.\d*)?)px$/.exec(str);
    if (match != null)
        return parseFloat(match[1]);
    else
        throw "Invalid unit";
}

function formatNumber(x) {
    return x.toPrecision(9);
}

function degToRad(x) {
    return x / 180 * Math.PI;
}

function radToDeg(x) {
    return x / Math.PI * 180;
}

// Workaround to avoid HTML parsing issues
function and(x, y) {
    return x ? y : false;
}

var DEGREE = "\u00B0";


// Square Area
function squareArea(a, b, c) {
    a = document.getElementById("height").value;
    b = document.getElementById("length").value;
    c = document.getElementById("area").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = a * b;
        document.getElementById("area").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = c / a;
        document.getElementById("length").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = c / b;
        document.getElementById("height").value = a;
    }
}

// Triangle Area
function triangleArea(a, b, c) {
    a = document.getElementById("height").value;
    b = document.getElementById("length").value;
    c = document.getElementById("area").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = (a * b) / 2;
        document.getElementById("area").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = (c * 2) / a;
        document.getElementById("length").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = (c * 2) / b;
        document.getElementById("height").value = a;
    }
}

// Central Angle Formula
function centralAngleFormula(a, b, c) {
    a = document.getElementById("radius").value;
    b = document.getElementById("arcLength").value;
    c = document.getElementById("angle").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = ((b * Math.PI) * 360) / (2 * Math.PI * a);
        document.getElementById("angle").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = ((c * 2 * Math.PI * a) / 360) / Math.PI;
        document.getElementById("arcLength").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = ((b * 360) / (2 * Math.PI * c)) * Math.PI;
        document.getElementById("radius").value = a;
    }
}

// Circle Area
function circleAreaOne(a, b) {
    a = document.getElementById("radiusOne").value;
    b = document.getElementById("areaOne").value;
    if ((a != 0) && !(isNaN(a))) {
        b = Math.PI * (a * a);
        document.getElementById("areaOne").value = b;
    } else if ((b != 0) && !(isNaN(b))) {
        a = Math.sqrt(b / Math.PI);
        document.getElementById("radiusOne").value = a;
    }
}

function circleAreaTwo(a, b) {
    a = document.getElementById("diameterTwo").value;
    b = document.getElementById("areaTwo").value;
    if ((a != 0) && !(isNaN(a))) {
        b = (Math.PI * (a * a)) / 4;
        document.getElementById("areaTwo").value = b;
    } else if ((b != 0) && !(isNaN(b))) {
        a = Math.sqrt((b * 4) / Math.PI);
        document.getElementById("diameterTwo").value = a;
    }
}

function circleAreaThree(a, b, c) {
    a = document.getElementById("radiusThree").value;
    b = document.getElementById("circumfThree").value;
    c = document.getElementById("areaThree").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = (b * a) / 2;
        document.getElementById("areaThree").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = (c * 2) / a;
        document.getElementById("circumfThree").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = (c * 2) / b;
        document.getElementById("radiusThree").value = a;
    }
}

// Regular Polygon Solver
function regPolygonArea(a, b, c) {
    a = document.getElementById("sideNum").value;
    b = document.getElementById("length").value;
    c = document.getElementById("area").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = ((b * b) * a) / (4 * Math.tan(Math.PI / a));
        document.getElementById("area").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = Math.sqrt((c * 4 * Math.tan(Math.PI / a)) / a);
        document.getElementById("length").value = b;
    }
}

// Cone Volume
function coneVol(a, b, c) {
    a = document.getElementById("height").value;
    b = document.getElementById("radius").value;
    c = document.getElementById("volume").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = (1 / 3) * Math.PI * (b * b) * a;
        document.getElementById("volume").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = Math.sqrt(c / (Math.PI * a * (1 / 3)));
        document.getElementById("radius").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = c / ((1 / 3) * Math.PI * (b * b));
        document.getElementById("height").value = a;
    }
}

// Cylinder Volume
function cylinderVol(a, b, c) {
    a = document.getElementById("height").value;
    b = document.getElementById("radius").value;
    c = document.getElementById("volume").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = Math.PI * (b * b) * a;
        document.getElementById("volume").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = Math.sqrt(c / (Math.PI * a));
        document.getElementById("radius").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = c / (Math.PI * (b * b));
        document.getElementById("height").value = a;
    }
}

// Ellipsoid Volume
function ellipsoidVol(a, b, c, d) {
    a = document.getElementById("height").value;
    b = document.getElementById("length").value;
    c = document.getElementById("width").value;
    d = document.getElementById("volume").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        d = (4 / 3) * Math.PI * a * b * c;
        document.getElementById("volume").value = d;
    } else if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (d != 0) && !(isNaN(d))) {
        c = d / (a * b * (4 / 3) * Math.PI);
        document.getElementById("width").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        b = d / (a * c * (4 / 3) * Math.PI);
        document.getElementById("length").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        a = d / (b * c * (4 / 3) * Math.PI);
        document.getElementById("height").value = a;
    }
}

// Rectanglur Prism Volume
function rectPrismVol(a, b, c, d) {
    a = document.getElementById("height").value;
    b = document.getElementById("length").value;
    c = document.getElementById("width").value;
    d = document.getElementById("volume").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        d = a * b * c;
        document.getElementById("volume").value = d;
    } else if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (d != 0) && !(isNaN(d))) {
        c = d / (a * b);
        document.getElementById("width").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        b = d / (a * c);
        document.getElementById("length").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        a = d / (b * c);
        document.getElementById("height").value = a;
    }
}

// Rectangular Pyramid Volume
function rectPyramidVol(a, b, c, d) {
    a = document.getElementById("height").value;
    b = document.getElementById("length").value;
    c = document.getElementById("width").value;
    d = document.getElementById("volume").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        d = (1 / 3) * a * b * c;
        document.getElementById("volume").value = d;
    } else if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (d != 0) && !(isNaN(d))) {
        c = d / (a * b * (1 / 3));
        document.getElementById("width").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        b = d / (a * c * (1 / 3));
        document.getElementById("length").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        a = d / (b * c * (1 / 3));
        document.getElementById("height").value = a;
    }
}

// Sphere Volume
function sphereVol(a, b) {
    a = document.getElementById("radius").value;
    b = document.getElementById("volume").value;
    if ((a != 0) && !(isNaN(a))) {
        b = (4 / 3) * Math.PI * (Math.pow(a, 3));
        document.getElementById("volume").value = b;
    } else if ((b != 0) && !(isNaN(b))) {
        a = Math.cbrt(b / ((4 / 3) * Math.PI));
        document.getElementById("radius").value = a;
    }
}

// Kinematics Distance 1 
function distanceKinType1(a, b, c, d) {
    a = document.getElementById("distance").value;
    b = document.getElementById("initVoloc").value;
    c = document.getElementById("accel").value;
    d = document.getElementById("time").value;
    if (!(isNaN(b)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        a = (b * d) + (0.5 * (d * d) * c);
        document.getElementById("distance").value = a;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        b = (a - (0.5 * (d * d) * c)) / d;
        document.getElementById("initVoloc").value = b;
    } else if ((a != 0) && !(isNaN(a)) && !(isNaN(b)) && (d != 0) && !(isNaN(d))) {
        c = (a - (b * d)) / (0.5 * (d * d));
        document.getElementById("accel").value = c;
    } else if ((a != 0) && !(isNaN(a)) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        var firstNum = 0.5 * c;
        var secondNum = b;
        var thirdNum = a * -1;
        var discr = (secondNum * secondNum) - 4 * (firstNum * thirdNum);
        var sqrDiscr = Math.sqrt(discr);
        if (firstNum == 0 && secondNum == 0 && thirdNum == 0) {
            document.getElementById('time').value = "Incorrect Inputs";
        } else if (discr < 0) {
            document.getElementById('time').value = "Complex Numbers";
        } else if (discr == 0) {
            document.getElementById('time').value = ((-secondNum - sqrDiscr) / (2 * firstNum));
        } else if (discr > 0) {
            document.getElementById('time').value = ((-secondNum + sqrDiscr) / (2 * firstNum)) + "; " + ((-secondNum - sqrDiscr) / (2 * firstNum));
        }
    }
}

// Kinematics Distance 2 
function distanceKinType2(a, b, c, d) {
    a = document.getElementById("distance").value;
    b = document.getElementById("finalVoloc").value;
    c = document.getElementById("accel").value;
    d = document.getElementById("time").value;
    if (!(isNaN(b)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        a = (b * d) - (0.5 * (d * d) * c);
        document.getElementById("distance").value = a;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        b = (a + (0.5 * (d * d) * c)) / d;
        document.getElementById("finalVoloc").value = b;
    } else if ((a != 0) && !(isNaN(a)) && !(isNaN(b)) && (d != 0) && !(isNaN(d))) {
        c = (a - (b * d)) / (-0.5 * (d * d));
        document.getElementById("accel").value = c;
    } else if ((a != 0) && !(isNaN(a)) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        var firstNum = 0.5 * c;
        var secondNum = b;
        var thirdNum = a * -1;
        var discr = (secondNum * secondNum) - 4 * (firstNum * thirdNum);
        var sqrDiscr = Math.sqrt(discr);
        if (firstNum == 0 && secondNum == 0 && thirdNum == 0) {
            document.getElementById('time').value = "Incorrect Inputs";
        } else if (discr < 0) {
            document.getElementById('time').value = "Complex Numbers";
        } else if (discr == 0) {
            document.getElementById('time').value = ((-secondNum - sqrDiscr) / (2 * firstNum));
        } else if (discr > 0) {
            document.getElementById('time').value = ((-secondNum + sqrDiscr) / (2 * firstNum)) + "; " + ((-secondNum - sqrDiscr) / (2 * firstNum));
        }
    }
}

// General Equation For --> a = b/c 
function leftEqualsFrac(a, b, c) {
    a = document.getElementById("leftSide").value;
    b = document.getElementById("topFrac").value;
    c = document.getElementById("bottomFrac").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b))) {
        c = b / a;
        document.getElementById("bottomFrac").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c))) {
        b = a * c;
        document.getElementById("topFrac").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        a = b / c;
        document.getElementById("leftSide").value = a;
    }
}

// Final Velocity With Acceleration and Time
function finalVelocWTimeAccel(a, b, c, d) {
    a = document.getElementById("finalVeloc").value;
    b = document.getElementById("initVeloc").value;
    c = document.getElementById("accel").value;
    d = document.getElementById("time").value;
    if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c))) {
        d = (a - b) / c;
        document.getElementById("time").value = d;
    } else if ((a != 0) && !(isNaN(a)) && (b != 0) && !(isNaN(b)) && (d != 0) && !(isNaN(d))) {
        c = (a - b) / d;
        document.getElementById("accel").value = c;
    } else if ((a != 0) && !(isNaN(a)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        b = a - (c * d);
        document.getElementById("initVeloc").value = b;
    } else if ((b != 0) && !(isNaN(b)) && (c != 0) && !(isNaN(c)) && (d != 0) && !(isNaN(d))) {
        a = b - (-c * d) ;
        document.getElementById("finalVeloc").value = a;
    }
}

function search() {
    //getting input
    var string = document.getElementById("input").value.toUpperCase();
    var matches = document.querySelectorAll("a[data-keywords]");
    matches.forEach(function(link) {
        var filter = link.getAttribute("data-keywords").toUpperCase();
        if (filter.indexOf(string)>=0) {
            // found the search string in the keywords
            link.style.display = "inline-block";
        } else {
            // search string isn't in the keywords
            link.style.display = "none";
        }
    });
}
