var settings = {
    nodeRadius: 10,
    nodeRadiusMultiplier: 1,
    nodes: 6,
    speed: 5000,
    color: { h:0, s:0, v:0.25 },
    showLines: true,
    showNodes: false
};

var Node = function( options ) {

    var x, y, parent, radius;

    this.x = this.ox = options.x || 0.0;
    this.y = this.oy = options.y || 0.0;
    this.radius = options.radius || settings.nodeRadius;
    this.parent = options.parent;

};

Node.prototype = {

    move: function(x, y) {
        var node = this;
        var tween = new TWEEN.Tween(node)
            .to({ x: x, y: y }, settings.speed)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function(){
                node.moving = false;
            })
            .start();

        node.moving = true;
    },

    update: function() {
        TWEEN.update();
    },

    draw: function( ctx ) {

        var h = settings.color.h * 0.95;
        var s = settings.color.s * 100 * 0.95;
        var v = settings.color.v * 100 * 0.95;
        var w = v + -10;

        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = 'hsl(' + h + ',' + s + '%,' + w + '%)';
        ctx.lineWidth = this.radius * 0.1;

        if (settings.showLines && this.parent) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.parent.x, this.parent.y);
            ctx.stroke();
        }

        if (settings.showNodes){
            ctx.moveTo(this.x + this.radius * settings.nodeRadiusMultiplier, this.y);
            ctx.arc( this.x, this.y, this.radius * settings.nodeRadiusMultiplier, 0, TWO_PI );
            ctx.stroke();
        }

    }
};

var modified = false;
var nodes = [];

var sketch = Sketch.create({

    container: document.getElementById( 'container' ),

    setup: function() {
        var node;
        for (i = 0; i < 20; i++){
            node = new Node({
                x: random(this.width*0.1, this.width*0.9),
                y: random(this.height*0.1, this.height*0.9)
            });
            nodes.push( node );
        }
    },

    update: function() {

        var t, pulse;

        t = this.millis;

        pulse = pow( sin( t * 0.001 * PI ), 18 );

        var node;
        for ( var i = 0, n = settings.nodes; i < n; i++ ) {

            node = nodes[i];

            node.parent = (i + 1 < settings.nodes) ? nodes[i + 1] : nodes[0];

            if (!node.moving){
                node.move(random(0 + node.radius, this.width - node.radius), random(0 + node.radius, this.height - node.radius));
            }

            node.update();
        }

    },

    draw: function() {

        for ( var i = 0, n = settings.nodes; i < n; i++ ) {
            nodes[i].draw(this);
        }

    },

    save: function() {

        window.open( this.canvas.toDataURL(), 'tentacles', "top=20,left=20,width=" + this.width + ",height=" + this.height );

    }
});

function onSettingsChanged() {
    modified = true;
}

var gui = new dat.GUI();
gui.add( settings, 'nodes' ).min( 3 ).max( 20 ).onChange( onSettingsChanged );
gui.add( settings, 'nodeRadiusMultiplier' ).min( 1 ).max( 5 ).onChange( onSettingsChanged );
gui.add( settings, 'speed' ).min( 1000 ).max( 10000 ).onChange( onSettingsChanged );

gui.add( settings, 'showLines' );
gui.add( settings, 'showNodes' );

var colorGUI = gui.addColor( settings, 'color' );

gui.add( sketch, 'autoclear' );
gui.add( sketch, 'save' );
gui.close();
