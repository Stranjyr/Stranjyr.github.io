let scene, camera, renderer, startingNodes, leafNodes, totalNodes, maxNodes, bumbBumb, ready, active, heartSound;

//Line Constants
let fixedY, startingLength, lineMaterial;

class ArteryNode{
    constructor(position, parent, depth, maxChildLen, maxAngle, minAngle, color, lineWidth){
        this.position = position;
        this.parent = parent;
        this.children = [];
        this.depth = depth;
        this.maxChildLen = maxChildLen;
        this.maxAngle = maxAngle;
        this.minAngle = minAngle;
        this.color = color;
        this.lineWidth = 1;
    }

    update(){
        if(Math.random() <= 1/((0.75*this.depth)+(0.1*this.children.length))){
            const angleRange = this.maxAngle - this.minAngle;
            const randAngle = Math.random() * angleRange + this.minAngle;
            const randLength = (1+Math.random()) * this.maxChildLen * 0.25;
            const childPos = {x: this.position.x + Math.cos(randAngle)*randLength, 
                              y: this.position.y + Math.sin(randAngle)*randLength
                            };
            
            const redShift = Math.floor(Math.random() * -75);
            const greenShift = Math.floor(Math.random() * 10 - 5);
            const blueShift = Math.floor(Math.random() * -75);
            
            const red = Math.max(Math.min(((this.color & 0xff0000) >> 16) + redShift, 0xff), 0);
            const green = Math.max(Math.min(((this.color & 0x00ff00) >> 8) + greenShift, 0xff), 0);
            const blue = Math.max(Math.min((this.color & 0x0000ff) + blueShift, 0xff), 0);
            const newColor = red << 16 | green << 8 | blue;
            const child = new ArteryNode(childPos, 
                                            this, 
                                            this.depth+1, 
                                            randLength*0.75, 
                                            randAngle + (angleRange/3) + 0.01, 
                                            randAngle - (angleRange/3) - 0.01, 
                                            newColor,
                                            Math.max(this.lineWidth * 0.75, 1));
            
            this.children.push(child);
            return child;
        }
        return null;
    }
}



function init(){

    totalNodes = 0;
    maxNodes = 20000;
    bumbBumb = false;
    active = false;
    ready = true;
    scene = new THREE.Scene();

    heartSound = document.getElementById("sound");
    

    camera = new THREE.OrthographicCamera( window.innerWidth / - 2,
        window.innerWidth / 2, 
        window.innerHeight / 2, 
        window.innerHeight / - 2, 
        1, 
        1000 
    );
    // camera = new THREE.PerspectiveCamera(
    //     100, 
    //     window.innerWidth/window.innerHeight, 
    //     0.1,
    //     1000
    // );
    
    renderer = new THREE.WebGLRenderer({antialias : true});
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(renderer.domElement);

    
    fixedY = 0;
    startingLength = 200;
    
    startingNodes = [];
    // startingNodes.push(new ArteryNode({x:0, y:0}, null, 1, startingLength, Math.PI*2, 0, 0xff00ff));
    camera.position.z = 50;
    leafNodes = []; //generateNewNodes(startingNodes);


    document.addEventListener('click', event => {
        if(ready){
            var x = (event.clientX - (window.innerWidth/2));
            var y = (-event.clientY + (window.innerHeight/2));
            console.log(x, y);
            leafNodes.push(new ArteryNode({x: x , y: y}, null, 0, startingLength * (Math.random()+.5), Math.PI*2, 0, 0xbb0a1e, 1))
            active = true;
        }
    });
    document.addEventListener('touchstart', event => {
        if(ready){
            var x = (event.clientX - (window.innerWidth/2));
            var y = (-event.clientY + (window.innerHeight/2));
            console.log(x, y);
            leafNodes.push(new ArteryNode({x: x , y: y}, null, 0, startingLength * (Math.random()+.5), Math.PI*2, 0, 0xbb0a1e, 1))
            active = true;
        }
    });

    heartZoom();
    setInterval(heartGrow, 100);
    
}

function heartGrow(){
    if(active){
        if((totalNodes > maxNodes)){
            setTimeout(reset, 5000);
            ready = false;
        }
        else if(active && leafNodes.length > 0){
            leafNodes = generateNewNodes(leafNodes);   
        }
    }
    
}

function heartZoom()
{
    if(active)
    {
        bumbBumb = !bumbBumb;
        heartSound.play();
        if(bumbBumb)
        {
            camera.zoom = 1.01;
        }
        else{
            camera.zoom = 1;
        }
        camera.updateProjectionMatrix();
        
    }
    setTimeout(heartZoom, (+bumbBumb)*1000 + 600);
    
}


function reset(){
    while (scene.children.length)
    {
        scene.remove(scene.children[0]);
    }
    totalNodes = 0;
    startingNodes = [];
    ready = true;
    active = false;
    // startingNodes.push(new ArteryNode({x:0, y:0}, null, 1, startingLength, Math.PI*2, 0, 0xff00ff));

    leafNodes = []; //generateNewNodes(startingNodes);
}


function generateNewNodes(nodeList){
    newLeaves = [];
    nodeList.forEach(node => {
        // while(true)
        // {
            const child = node.update()
            if(child !== null){
                newLeaves.push(node);
                newLeaves.push(child);
    
    
                const points = [];
                points.push( new THREE.Vector3( node.position.x, node.position.y, fixedY ) );
                points.push( new THREE.Vector3(child.position.x, child.position.y, fixedY ) );
                const geometry = new THREE.BufferGeometry().setFromPoints( points );
                const lineMaterial = new THREE.LineBasicMaterial({color: child.color, linewidth: 1});
                const line = new THREE.Line(geometry, lineMaterial);
                scene.add(line);
                totalNodes += 1;
            }
        //     else{
        //         break;
        //     }
        // }
        
    });
    return newLeaves;
}



function animate()
{
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);
init();
animate();