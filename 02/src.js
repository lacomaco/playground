const font = '20px serif'

class Renderer {
    components= [];
    animationFrameId;

    constructor(){
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.cordinate = new Cordinate(this.canvas.width,this.canvas.height,this.context);
        
        window.cordinate = this.cordinate;

        this.circle = new Circle(this.context, this.canvas,this.cordinate);

        this.slideControl = new SlideControl(this.context,this.canvas);
        this.slideControl.attachSlideEvent(this.render.bind(this));

        this.triangleFunction = new Trigonometric(this.canvas,this.context,this.cordinate,this.circle);
        this.components.push(this.triangleFunction);
        this.slideControl.addValueChangeCb(this.triangleFunction.valueChange$.bind(this.triangleFunction));

        this.components.push(this.cordinate);
        this.components.push(this.slideControl);
        this.components.push(this.circle);

        this.slideControl.addValueChangeCb(this.circle.valueChange$.bind(this.circle));
        
        this.render();
    }

    render(){
        window.cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = window.requestAnimationFrame(()=>{
            this.context.clearRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
    
            this.components.forEach((component)=>{
                component.render();
            })
        });
    }

    debounce(cb,limit = 0){
        let timeout;

        return (...args) =>{
            clearTimeout(timeout);
            timeout = setTimeout(()=>{
                cb.apply(null,args);
            },limit);
        }
    }
}

class Cordinate {
    vectorInformation=[];
    circleRadius = 100;
    xCordinate=[];
    yCordinate=[];
    
    constructor(width,height,context){
        this.width = width;
        this.height = height;
        this.context = context;


        this.drawCordinateText();
    }

    render(){
        this.drawCordinateLine();
        this.drawMainCircle();
        this.drawCordinateText();
    }

    drawCordinateLine(){
        this.context.beginPath();

        // x축
        this.context.moveTo(0,this.height/2);
        this.context.lineTo(this.width,this.height/2);

        // y축
        this.context.moveTo(this.width/2,0);
        this.context.lineTo(this.width/2,this.height);

        this.context.stroke();
    }

    drawMainCircle(){
        this.context.save();

        this.context.beginPath();
        this.context.arc(
            this.width/2,
            this.height/2,
            this.circleRadius,
            0,
            window.Math.PI * 2
        )

        this.context.stroke();
        this.context.restore();
    }

    drawCordinateText() {
        this.context.save();
        const ygap = 15;
        this.context.font = '15px serif'


        this.xCordinate = [];
        this.yCordinate = [];

        // 중앙 점
        this.context.beginPath();

        // x축 그리기
        let xAxisValue = [];

        for(let i = 0; i <= this.width / this.circleRadius; i++){
            xAxisValue.push(i);
        }

        xAxisValue = xAxisValue.map((value)=>{
            const axisCount = (this.width) / this.circleRadius;

            return value - axisCount/2;
        });

        xAxisValue.forEach((value,i)=>{
            this.context.fillText(value,i * this.circleRadius, this.height/2 + ygap);
        })

        this.xCordinate.push(xAxisValue[0]);
        this.xCordinate.push(xAxisValue[xAxisValue.length-1]);


        // y축 그리기
        let yAxisValue = [];

        for(let i = 0;i <= this.height / this.circleRadius; i++){
            yAxisValue.push(i);
        }

        yAxisValue = yAxisValue.map((value,i)=>{
            const axisCount = (this.height) / this.circleRadius;

            return value - axisCount / 2;
        });

        this.yCordinate.push(yAxisValue[0]);
        this.yCordinate.push(yAxisValue[yAxisValue.length-1]);

        yAxisValue.reverse().forEach((value,i)=>{
            if(value === 0){
                return;
            }
            this.context.fillText(value, this.width/2 + 3, this.circleRadius * i);
        })



        this.context.restore();
    }

    valueToGraph(number){

        const xAxisCount = this.xCordinate[1] - this.xCordinate[0];
        const yAxisCount = this.yCordinate[1] - this.yCordinate[0];

        /*
        3 -> 0

        0 -> 300

        -3 -> 600 나와야함
        */

        /*
        yAxisCount : this.height = number : x

        x * yAxisCount = number * this.height

        x = number * this.height / yAxisCount
        */

        return {
            x:(number + window.Math.abs(this.xCordinate[0]))*this.width / xAxisCount,
            y: (window.Math.abs((number - this.yCordinate[1]) * this.height)) / yAxisCount
        }
    }
}

class SlideControl {
    line = 20;
    isMouseDown = false;
    valueChangeCb = [];

    slidePosition = {
        x: 50,
        y:50,
        length:360,
    }

    circlePosition = {
        x: 50,
        y: 50,
        value: 0, // 0 ~ 360 degree
        radius: 10,
    }

    constructor(context,canvas){
        this.context = context;
        this.canvas = canvas;
    }

    render(){
        this.drawSlideLine();
        this.drawCircle();
        this.drawText();
    }

    drawSlideLine() {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this.slidePosition.x,this.slidePosition.y);
        this.context.lineTo(
            this.slidePosition.x + this.slidePosition.length,
            this.slidePosition.y
        );
        this.context.stroke();
        this.context.restore();

    }

    drawCircle() {
        this.context.save();
        this.context.beginPath();
        this.context.arc(
            this.circlePosition.x,
            this.circlePosition.y,
            this.circlePosition.radius,
            0,
            window.Math.PI * 2
        );
        this.context.fillStyle ='white';
        this.context.strokeStyle = 'black';
        
        this.context.fill();
        this.context.stroke();
        this.context.restore();
    }

    drawText() {
        this.context.font = font;
        this.context.fillText(`θ: ${this.circlePosition.value}`,this.circlePosition.x - this.circlePosition.radius,this.circlePosition.y - 15);
    }

    attachSlideEvent(stateChangeCB){
        this.canvas.addEventListener('mousemove',(e)=>{
            const canvasRect = e.target.getBoundingClientRect();
            const x = e.pageX - canvasRect.x;
            const y = e.pageY - canvasRect.y;

            if(
                x >= this.slidePosition.x - this.circlePosition.radius -1 &&
                x < this.slidePosition.x + this.slidePosition.length + this.circlePosition.radius + 1 &&
                y >= this.slidePosition.y - this.circlePosition.radius - 1 &&
                y < this.slidePosition.y + this.circlePosition.radius + 1
            ){
                this.canvas.style = 'cursor:pointer';
            } else {
                this.canvas.style = '';
            }
        });

        this.canvas.addEventListener('mousedown',(e)=>{
            if(this.isMouseInCircle(e)){
                this.isMouseDown = true;
                return;
            }

            this.isMouseDown = false;
        });

        this.canvas.addEventListener('mouseup',()=>{
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('mousemove',(e)=>{
            const canvasRect = e.target.getBoundingClientRect();
            const x = e.pageX - canvasRect.x;

            if(!this.isMouseDown || !stateChangeCB){
                return;
            }


            if( x < this.slidePosition.x){
                this.circlePosition.x = this.slidePosition.x;
            }else if( x >  this.slidePosition.x + this.slidePosition.length){
                this.circlePosition.x = this.slidePosition.x + this.slidePosition.length;
            }else {
                this.circlePosition.x = x;
            }

            this.valueChange(this.circlePosition.x - this.slidePosition.x);
            stateChangeCB();
        });
    }

    isMouseInCircle(event){
        const canvasRect = event.target.getBoundingClientRect();
        const x = event.pageX - canvasRect.x;
        const y = event.pageY - canvasRect.y;
        

        return window.Math.pow(this.circlePosition.radius,2) >= 
        window.Math.pow(this.circlePosition.x - x, 2) + window.Math.pow(this.circlePosition.y - y,2);
    }

    valueChange(number){
        this.circlePosition.value = number;
        this.valueChangeCb.forEach((cb)=>{
            cb(number);
        });
    }

    addValueChangeCb(cb){
        this.valueChangeCb.push(cb);
    }
}

class Circle {
    rad = 0;
    radius = 30;

    constructor(context,canvas, cordinate) {
        this.context = context;
        this.canvas = canvas;
        this.cordinate = cordinate;
    }

    render(){
        this.renderCircle();
        this.renderText();
        this.renderGraph();
    }

    renderCircle(){
        this.context.save();
        this.context.beginPath();

        this.context.moveTo(this.canvas.width/2,this.canvas.height/2);

        this.context.fillStyle = 'rgba(5,255,161,0.9)';

        this.context.arc(
            this.canvas.width/2,
            this.canvas.height/2,
            this.radius,
            0,
            - this.rad,
            true
        );
        
        this.context.fill();
        this.context.restore();
    }

    renderText(){
        const x = window.Math.cos(this.rad) * this.radius;
        const y = -window.Math.sin(this.rad) * this.radius;

        this.context.save();

        this.context.font = '11px serif'

        this.context.fillText(`rad: ${this.rad}`,this.canvas.width/2 + x,this.canvas.height/2 + y);

        this.context.restore();
    }

    renderGraph(){
        this.context.save();
        this.context.beginPath();

        const {x, y} = this.getCurrentCircleXY();

        this.context.moveTo(this.canvas.width/2,this.canvas.height/2);
        this.context.lineTo(x,y);

        this.context.stroke();
        this.context.restore();
    }

    valueChange$(degree) {
        this.rad = degree * window.Math.PI / 180;
    }

    getCurrentCircleXY() {
        return {
            x: window.Math.cos(this.rad) * this.cordinate.circleRadius + this.canvas.width/2,
            y: window.Math.sin(this.rad) * -this.cordinate.circleRadius + this.canvas.height/2
        }
    }

    // 수직인 접선인데 영어로 뭐지 ㅎ.. ㅗ
    bubsun() {
        let {x:cx,y:cy} = this.getCurrentCircleXY();
        cx -= this.canvas.width/2;
        cy -= this.canvas.height/2

        // 선분의 기울기
        const m = -(cx/cy);

        // 기울기를 구했으니 이제 n을 구해야함 y = m*x + n;
        // n = y - m*x;

        const n = cy - m*cx;

        return {
            m,
            // y는 항상 0
            getX: () => {
                return window.Math.max(window.Math.min(
                    - n / m + this.canvas.width/2
                    ,this.canvas.width),0);
            },
            // x는 항상 0
            getY: () => {
                return window.Math.max(window.Math.min(n + this.canvas.height/2,this.canvas.height),0);
            }
        }
    }
}

class Trigonometric {
    functionNames = ['sin','cos','tan','csc','sec','cot'];
    textYGap = 30;
    textX = 30;
    textY = 50;

    trigonometricFunction = {
        sin: window.Math.sin,
        cos: window.Math.cos,
        tan: window.Math.tan,
        csc: (rad)=>{
            return 1 / window.Math.sin(rad)
        },
        sec: (rad)=>{
            return 1 / window.Math.cos(rad);
        },
        cot: (rad)=>{
            return 1 / window.Math.tan(rad);
        }, 
    }

    lineColor = {
        sin: 'rgb(189,101,240)',
        cos: 'rgb(177,45,208)',
        tan: 'rgb((242,183,240)',
        csc: 'rgb(217,43,80)',
        sec: 'rgb(185,103,255)',
        cot: 'rgb(179,232,121)',
    }

    rad = 0;

    constructor(canvas,context,cordinate,circle){
        this.canvas = canvas;
        this.context = context;
        this.cordinate = cordinate;
        this.circle = circle;
    }
    
    render(){
        this.renderValueText();
        this.renderGraph();
    }

    valueChange$(degree) {
        this.rad = degree * window.Math.PI / 180;
    }

    renderValueText(){
        this.context.save();
        this.context.beginPath();

        this.context.font = font;

        this.functionNames.forEach((name,i)=>{
            this.context.fillText(`${name} : ${this.trigonometricFunction[name](this.rad)}`,this.textX,this.textY + (i+1)*this.textYGap);
        })

        this.context.restore();
    }

    renderGraph(){
        this.context.save();

        const {x,y} = this.circle.getCurrentCircleXY();

        this.functionNames.forEach((name)=>{
            this.context.beginPath();
            this.context.fillStyle = this.lineColor[name];
    
            if(name === 'cos'){
                this.context.moveTo(x,y);
                this.context.lineTo(this.canvas.width/2,y);

            } else if(name === 'sin'){
                this.context.moveTo(x,y);
                this.context.lineTo(x,this.canvas.height/2);
            } else if(name === 'tan') {
                const {m,getX,getY} = this.circle.bubsun();

                if( m === Infinity || m === -Infinity){
                    return;
                }

                const x = getX();
                const y = getY();

                this.context.moveTo(x,this.canvas.height/2);
                this.context.lineTo(this.canvas.width/2,y);

            } else if (name === 'csc'){

            } else if (name === 'sec'){

            }

            this.context.stroke();
        });

        this.context.restore();
    }
}

const renderer = new Renderer();
