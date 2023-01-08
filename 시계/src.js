const canvas = document.querySelector('#background');
const backgroundContext = document.querySelector('#background').getContext('2d');
const chimContext = document.querySelector('#chim').getContext('2d');

backgroundContext.canvas.width = canvas.clientWidth;
chimContext.canvas.width = canvas.clientWidth;

backgroundContext.canvas.height = canvas.clientHeight;
chimContext.canvas.height = canvas.clientHeight;

const FONT_HEIGHT = 15;
const MARGIN = 35;
const HAND_TRUNCATION = canvas.clientWidth/25;
const HOUR_HAND_TRUNCATION = canvas.clientWidth/10;
const NUMERAL_SPACING = 20;
const RADIUS = canvas.clientWidth / 2 - MARGIN;
const HAND_RADIUS = RADIUS + NUMERAL_SPACING;
const RADIAN = 180 / Math.PI; // 180 -> degree

/*
1 라디안 : 호의 길이가 반지름 r이랑 같은것

1 라디안은 180(degree) / MATH.PI와 동일함

증명 과정

360(degree) : 2*pi*r = 1radian : r

1radian * 2 * pi * r = r * 360

1radian = 180/pi

원 한바퀴는 2 * pi * radian 이다.


*/

function drawBackground(){
    function drawCircle(){
        backgroundContext.beginPath();
        backgroundContext.arc(canvas.clientWidth/2, canvas.clientHeight/2, RADIUS, 0, Math.PI * 2, true);
        backgroundContext.stroke();
    }
    function pointCenter(){
        backgroundContext.beginPath();
        backgroundContext.arc(
            canvas.clientWidth/2,
            canvas.clientHeight/2,
            3,
            0,
            Math.PI*2
        )
        backgroundContext.fill();
    }

    function drawNumerals(){
        const numerlas = [3,2,1,12,11,10,9,8,7,6,5,4];
        const angle = Math.PI/6;
        let numeralWidth = 0;
        numerlas.forEach((numeral,index)=>{
            numeralWidth = backgroundContext.measureText(numeral).width;
            const x = canvas.clientWidth/2 + HAND_RADIUS * Math.cos(angle*index) ;
            const y = canvas.clientHeight/2 - HAND_RADIUS * Math.sin(angle*index) + FONT_HEIGHT/3;
            backgroundContext.fillText(numeral,x,y);
        })
    }
    drawCircle();
    drawNumerals();
    pointCenter();
}

drawBackground();

// ...........................................................................
/*
분침은 60개

degree로는 6도이다.

1radian * x = 6

180*x/pi = 6

x = 6*pi/180 이다.

1radian * p = 90

180*p/pi = 90

p = pi/2;
*/

const chimGap = 10;
const chimRadius = RADIUS - chimGap;

const currentChimPosition = {
    x:canvas.width/2,
    y: canvas.height/2 - chimRadius,
    radian:Math.PI/2,
}


let test = 0;
function calculateCurrentChim() {
    const chimConstant = Math.PI / 30;

    const nextRadian = currentChimPosition.radian + chimConstant;

    const nextX =  canvas.width/2 - Math.cos(nextRadian) * chimRadius;
    const nextY =  canvas.height/2 - Math.sin(nextRadian) * chimRadius;


    currentChimPosition.radian = nextRadian;

    currentChimPosition.x = nextX;
    currentChimPosition.y = nextY;

}

function drawChim() {
    chimContext.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
    chimContext.save();
    chimContext.beginPath();
    chimContext.lineWidth = 2;
    chimContext.moveTo(canvas.clientWidth/2,canvas.clientHeight/2);
    chimContext.lineTo(currentChimPosition.x,currentChimPosition.y);
    chimContext.stroke();
    chimContext.restore();
}

drawChim();

setInterval(()=>{
    calculateCurrentChim();
    drawChim();
},1000)
