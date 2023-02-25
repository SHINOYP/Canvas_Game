const canvas=document.querySelector('canvas');

const c=canvas.getContext('2d')
canvas.width=innerWidth
canvas.height=innerHeight

const scoreEl=document.querySelector('#scoreEl')
const startGamebtn=document.querySelector("#startGamebtn")
const modelEl=document.querySelector("#modelEl")
const bigScore=document.querySelector("#bigScore")


class Player{
    constructor(x,y,radius,color){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
    }
}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x=this.x + this.velocity.x
        this.y=this.y + this.velocity.y
    }
}


class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x=this.x + this.velocity.x
        this.y=this.y + this.velocity.y
    }
}
const friction=0.99

class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha=1
    }
    draw(){
        c.save()
        c.globalAlpha=this.alpha
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
        c.restore()
    }
    update(){
        this.draw()
        this.velocity.x*=friction
        this.velocity.y*=friction
        this.x=this.x + this.velocity.x
        this.y=this.y + this.velocity.y
        this.alpha-=0.01
    }
}


const x=canvas.width / 2
const y=canvas.height / 2

let player=new Player(x,y,30,'white')
let projectiles=[]
let enemies=[]
let particles=[]


function init(){
    player=new Player(x,y,30,'white')
     projectiles=[]
    enemies=[]
     particles=[]
     score=0;
     scoreEl.innerHTML=score
     bigScore.innerHTML=score
}

function spawnEnemies(){
    
    setInterval(()=>{
        const radius=Math.random()* ( 30-20 ) + 20
        if(score <100){
            srValue=1
        }
        if(score>750){
            srValue=1.5
        }
        if(score>1000){
            srValue=1.9
        }
        if(score>1500){
            srValue=2
        }
        if(score>2000){
            srValue=2.5
        }
        if(score>2500){
            srValue=2.8
        }
        if(score>3000){
            srValue=3
        }
        let x;
        let y;

        if(Math.random()<0.5){
            x=Math.random()<0.5 ? 0-radius :canvas.width+radius
            y=Math.random() *canvas.height
        }else{
            x=Math.random()  *canvas.width
            y=Math.random()<0.5 ? 0-radius :canvas.height+radius 

        }
        
        const color=`hsl(${Math.random()*360},50%,50%)`
        const angle=Math.atan2(
            canvas.height/2-y,
            canvas.width/2-x)
        const velocity={
            
            x:Math.cos(angle)*srValue,
            y:Math.sin(angle)*srValue
        }
    

       enemies.push(new Enemy(x,y,radius,color,velocity))
      
    },1000)
 }


 let animationId
 let score=0

let srValue





function animate(){
    animationId=requestAnimationFrame(animate)
    c.fillStyle='rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle,index)=>{
        if(particle.alpha<=0){
            particles.splice(index,1)
        }else{
            particle.update()
        }
       
    })
    projectiles.forEach((projectile,index) => {
        projectile.update()

        //remove when goes of the screen the bullets
        if(projectile.x-projectile.radius <0 || 
            projectile.x-projectile.radius>canvas.width ||
            projectile.y+projectile.radius<0||
            projectile.y-projectile.radius>canvas.height){
            setTimeout(()=>{
                 projectiles.splice(index,1)
            },0)
        }
    });

    //end game
    enemies.forEach((enemy,index)=>{
        enemy.update()
        const dist= Math.hypot(player.x -enemy.x, player.y-enemy.y)
        if(dist-enemy.radius-player.radius<1){
            {
              cancelAnimationFrame(animationId)
              modelEl.style.display='flex'
              bigScore.innerHTML=score
            }
            
        }

        projectiles.forEach((projectile,projectilesIndex)=>{
           const dist= Math.hypot(projectile.x -enemy.x, projectile.y-enemy.y)
           
           //when projectile touch emeny
           if(dist-enemy.radius-projectile.radius<1){
            {   
               
                //create exlosion
                for(i=0;i<enemy.radius;i++){
                    particles.push(new Particle(projectile.x,
                        projectile.y,Math.random()*2,enemy.color,{
                            x:(Math.random()-0.5)*(Math.random()*5),
                            y:(Math.random()-0.5)*(Math.random()*5)
                        }))
                }
                if(enemy.radius-10>15){
                    //increase the score
                    score+=50
                    scoreEl.innerHTML=score
                    gsap.to(enemy,{
                        radius:enemy.radius-10
                    })
                    setTimeout(()=>{
                         projectiles.splice(projectilesIndex,1)
                    },0)

                }else{
                    //remove from scene
                    score+=50
                    scoreEl.innerHTML=score
                    setTimeout(()=>{
                        enemies.splice(index,1)
                         projectiles.splice(projectilesIndex,1)
                    },0)
                }
                
            }
            
           }
        })
    })

}

window.addEventListener('click',(event)=>{
    console.log(projectiles)
    const angle=Math.atan2(
        event.clientY-canvas.height/2,
        event.clientX-canvas.width/2)
    const velocity={
        x:Math.cos(angle)*6,
        y:Math.sin(angle)*6
    }

        console.log(angle)
    projectiles.push(new Projectile(canvas.width/2,
    canvas.height/2,5,'white',velocity))
})

startGamebtn.addEventListener('click',()=>{
    init()
    animate()
    spawnEnemies()
    modelEl.style.display='none'
})
