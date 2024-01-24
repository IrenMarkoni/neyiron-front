"use strict";

function heroAnim() {
  var canvas, ctx, circ, nodes, mouse, SENSITIVITY, SIBLINGS_LIMIT, DENSITY, NODES_QTY, ANCHOR_LENGTH, MOUSE_RADIUS; // how close next node must be to activate connection (in px)
  // shorter distance == better connection (line width)

  SENSITIVITY = 100; // note that siblings limit is not 'accurate' as the node can actually have more connections than this value that's because the node accepts sibling nodes with no regard to their current connections this is acceptable because potential fix would not result in significant visual difference
  // more siblings == bigger node

  SIBLINGS_LIMIT = 10; // default node margin
  // total number of nodes used (incremented after creation)

  NODES_QTY = 0; // avoid nodes spreading

  ANCHOR_LENGTH = 20; // highlight radius

  if ($(window).width() > 600) {
    MOUSE_RADIUS = 350;
  } else if ($(window).width() > 400) {
    MOUSE_RADIUS = 300;
  } else {
    MOUSE_RADIUS = 200;
  }

  DENSITY = 55;
  circ = 2 * Math.PI;
  nodes = [];
  canvas = document.querySelector("canvas");
  resizeWindow();
  mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };
  ctx = canvas.getContext("2d");

  if (!ctx) {
    alert("Ooops! Your browser does not support canvas :'(");
  }

  function Node(x, y) {
    this.anchorX = x;
    this.anchorY = y;
    this.x = Math.random() * (x - (x - ANCHOR_LENGTH)) + (x - ANCHOR_LENGTH);
    this.y = Math.random() * (y - (y - ANCHOR_LENGTH)) + (y - ANCHOR_LENGTH);
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.energy = Math.random() * 100;
    this.radius = Math.random();
    this.siblings = [];
    this.brightness = 0;
  }

  Node.prototype.drawNode = function () {
    var color = "rgba(32, 38, 178, " + this.brightness + ")";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2 * this.radius + 2 * this.siblings.length / SIBLINGS_LIMIT, 0, circ);
    ctx.fillStyle = color;
    ctx.fill();
  };

  Node.prototype.drawConnections = function () {
    for (var i = 0; i < this.siblings.length; i++) {
      var color = "rgba(32, 38, 178, " + this.brightness + ")";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.siblings[i].x, this.siblings[i].y);
      ctx.lineWidth = 1 - calcDistance(this, this.siblings[i]) / SENSITIVITY;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  };

  Node.prototype.moveNode = function () {
    this.energy -= 2;

    if (this.energy < 1) {
      this.energy = Math.random() * 100;

      if (this.x - this.anchorX < -ANCHOR_LENGTH) {
        this.vx = Math.random() * 2;
      } else if (this.x - this.anchorX > ANCHOR_LENGTH) {
        this.vx = Math.random() * -2;
      } else {
        this.vx = Math.random() * 4 - 2;
      }

      if (this.y - this.anchorY < -ANCHOR_LENGTH) {
        this.vy = Math.random() * 2;
      } else if (this.y - this.anchorY > ANCHOR_LENGTH) {
        this.vy = Math.random() * -2;
      } else {
        this.vy = Math.random() * 4 - 2;
      }
    }

    this.x += this.vx * this.energy / 100;
    this.y += this.vy * this.energy / 100;
  };

  function initNodes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes = [];

    for (var i = DENSITY; i < canvas.width; i += DENSITY) {
      for (var j = DENSITY; j < canvas.height; j += DENSITY) {
        nodes.push(new Node(i, j));
        NODES_QTY++;
      }
    }
  }

  function calcDistance(node1, node2) {
    return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
  }

  function findSiblings() {
    var node1, node2, distance;

    for (var i = 0; i < NODES_QTY; i++) {
      node1 = nodes[i];
      node1.siblings = [];

      for (var j = 0; j < NODES_QTY; j++) {
        node2 = nodes[j];

        if (node1 !== node2) {
          distance = calcDistance(node1, node2);

          if (distance < SENSITIVITY) {
            if (node1.siblings.length < SIBLINGS_LIMIT) {
              node1.siblings.push(node2);
            } else {
              var node_sibling_distance = 0;
              var max_distance = 0;
              var s;

              for (var k = 0; k < SIBLINGS_LIMIT; k++) {
                node_sibling_distance = calcDistance(node1, node1.siblings[k]);

                if (node_sibling_distance > max_distance) {
                  max_distance = node_sibling_distance;
                  s = k;
                }
              }

              if (distance < max_distance) {
                node1.siblings.splice(s, 1);
                node1.siblings.push(node2);
              }
            }
          }
        }
      }
    }
  }

  function redrawScene() {
    resizeWindow();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    findSiblings();
    var i, node, distance;

    for (i = 0; i < NODES_QTY; i++) {
      node = nodes[i];
      distance = calcDistance({
        x: mouse.x,
        y: mouse.y
      }, node);

      if (distance < MOUSE_RADIUS) {
        node.brightness = 1 - distance / MOUSE_RADIUS;
      } else {
        node.brightness = 0;
      }
    }

    for (i = 0; i < NODES_QTY; i++) {
      node = nodes[i];

      if (node.brightness) {
        node.drawNode();
        node.drawConnections();
      }

      node.moveNode();
    }

    requestAnimationFrame(redrawScene);
  }

  function initHandlers() {
    document.addEventListener("resize", resizeWindow, false); // canvas.addEventListener("mousemove", mousemoveHandler, false);
  }

  function resizeWindow() {
    if ($(window).width() > 1400) {
      canvas.width = $(".hero__anim").width();
      canvas.height = $(".hero__anim").height() * 1.5;
    } else if ($(window).width() > 992) {
      canvas.width = $(".hero__anim").width();
      canvas.height = $(".hero__anim").height() * 1.8;
    } else if ($(window).width() > 600) {
      canvas.width = $(".hero__anim").width();
      canvas.height = $(".hero__anim").height() * 1.7;
    } else {
      var parentWidth = $(".hero__anim").width() - 50; // canvas.width = parentWidth;
      // canvas.height = parentWidth;

      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth * 1.02;
    }
  }

  function mousemoveHandler(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  initHandlers();
  initNodes();
  redrawScene();
}

heroAnim();
$(window).resize(function () {
  heroAnim();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS5qcyIsIm5hbWVzIjpbImhlcm9BbmltIiwiY2FudmFzIiwiY3R4IiwiY2lyYyIsIm5vZGVzIiwibW91c2UiLCJTRU5TSVRJVklUWSIsIlNJQkxJTkdTX0xJTUlUIiwiREVOU0lUWSIsIk5PREVTX1FUWSIsIkFOQ0hPUl9MRU5HVEgiLCJNT1VTRV9SQURJVVMiLCIkIiwid2luZG93Iiwid2lkdGgiLCJNYXRoIiwiUEkiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJyZXNpemVXaW5kb3ciLCJ4IiwieSIsImhlaWdodCIsImdldENvbnRleHQiLCJhbGVydCIsIk5vZGUiLCJhbmNob3JYIiwiYW5jaG9yWSIsInJhbmRvbSIsInZ4IiwidnkiLCJlbmVyZ3kiLCJyYWRpdXMiLCJzaWJsaW5ncyIsImJyaWdodG5lc3MiLCJwcm90b3R5cGUiLCJkcmF3Tm9kZSIsImNvbG9yIiwiYmVnaW5QYXRoIiwiYXJjIiwibGVuZ3RoIiwiZmlsbFN0eWxlIiwiZmlsbCIsImRyYXdDb25uZWN0aW9ucyIsImkiLCJtb3ZlVG8iLCJsaW5lVG8iLCJsaW5lV2lkdGgiLCJjYWxjRGlzdGFuY2UiLCJzdHJva2VTdHlsZSIsInN0cm9rZSIsIm1vdmVOb2RlIiwiaW5pdE5vZGVzIiwiY2xlYXJSZWN0IiwiaiIsInB1c2giLCJub2RlMSIsIm5vZGUyIiwic3FydCIsInBvdyIsImZpbmRTaWJsaW5ncyIsImRpc3RhbmNlIiwibm9kZV9zaWJsaW5nX2Rpc3RhbmNlIiwibWF4X2Rpc3RhbmNlIiwicyIsImsiLCJzcGxpY2UiLCJyZWRyYXdTY2VuZSIsIm5vZGUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJpbml0SGFuZGxlcnMiLCJhZGRFdmVudExpc3RlbmVyIiwicGFyZW50V2lkdGgiLCJpbm5lcldpZHRoIiwibW91c2Vtb3ZlSGFuZGxlciIsImUiLCJjbGllbnRYIiwiY2xpZW50WSIsInJlc2l6ZSJdLCJzb3VyY2VzIjpbImFuaW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gaGVyb0FuaW0oKSB7XHJcbiAgdmFyIGNhbnZhcyxcclxuICAgIGN0eCxcclxuICAgIGNpcmMsXHJcbiAgICBub2RlcyxcclxuICAgIG1vdXNlLFxyXG4gICAgU0VOU0lUSVZJVFksXHJcbiAgICBTSUJMSU5HU19MSU1JVCxcclxuICAgIERFTlNJVFksXHJcbiAgICBOT0RFU19RVFksXHJcbiAgICBBTkNIT1JfTEVOR1RILFxyXG4gICAgTU9VU0VfUkFESVVTO1xyXG5cclxuICAvLyBob3cgY2xvc2UgbmV4dCBub2RlIG11c3QgYmUgdG8gYWN0aXZhdGUgY29ubmVjdGlvbiAoaW4gcHgpXHJcbiAgLy8gc2hvcnRlciBkaXN0YW5jZSA9PSBiZXR0ZXIgY29ubmVjdGlvbiAobGluZSB3aWR0aClcclxuICBTRU5TSVRJVklUWSA9IDEwMDtcclxuICAvLyBub3RlIHRoYXQgc2libGluZ3MgbGltaXQgaXMgbm90ICdhY2N1cmF0ZScgYXMgdGhlIG5vZGUgY2FuIGFjdHVhbGx5IGhhdmUgbW9yZSBjb25uZWN0aW9ucyB0aGFuIHRoaXMgdmFsdWUgdGhhdCdzIGJlY2F1c2UgdGhlIG5vZGUgYWNjZXB0cyBzaWJsaW5nIG5vZGVzIHdpdGggbm8gcmVnYXJkIHRvIHRoZWlyIGN1cnJlbnQgY29ubmVjdGlvbnMgdGhpcyBpcyBhY2NlcHRhYmxlIGJlY2F1c2UgcG90ZW50aWFsIGZpeCB3b3VsZCBub3QgcmVzdWx0IGluIHNpZ25pZmljYW50IHZpc3VhbCBkaWZmZXJlbmNlXHJcbiAgLy8gbW9yZSBzaWJsaW5ncyA9PSBiaWdnZXIgbm9kZVxyXG4gIFNJQkxJTkdTX0xJTUlUID0gMTA7XHJcbiAgLy8gZGVmYXVsdCBub2RlIG1hcmdpblxyXG5cclxuICAvLyB0b3RhbCBudW1iZXIgb2Ygbm9kZXMgdXNlZCAoaW5jcmVtZW50ZWQgYWZ0ZXIgY3JlYXRpb24pXHJcbiAgTk9ERVNfUVRZID0gMDtcclxuICAvLyBhdm9pZCBub2RlcyBzcHJlYWRpbmdcclxuICBBTkNIT1JfTEVOR1RIID0gMjA7XHJcbiAgLy8gaGlnaGxpZ2h0IHJhZGl1c1xyXG5cclxuICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA2MDApIHtcclxuICAgIE1PVVNFX1JBRElVUyA9IDM1MDtcclxuICB9IGVsc2UgaWYgKCQod2luZG93KS53aWR0aCgpID4gNDAwKSB7XHJcbiAgICBNT1VTRV9SQURJVVMgPSAzMDA7XHJcbiAgfSBlbHNlIHtcclxuICAgIE1PVVNFX1JBRElVUyA9IDIwMDtcclxuICB9XHJcbiAgREVOU0lUWSA9IDU1O1xyXG5cclxuICBjaXJjID0gMiAqIE1hdGguUEk7XHJcbiAgbm9kZXMgPSBbXTtcclxuXHJcbiAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNhbnZhc1wiKTtcclxuICByZXNpemVXaW5kb3coKTtcclxuICBtb3VzZSA9IHtcclxuICAgIHg6IGNhbnZhcy53aWR0aCAvIDIsXHJcbiAgICB5OiBjYW52YXMuaGVpZ2h0IC8gMixcclxuICB9O1xyXG4gIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgaWYgKCFjdHgpIHtcclxuICAgIGFsZXJ0KFwiT29vcHMhIFlvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGNhbnZhcyA6JyhcIik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBOb2RlKHgsIHkpIHtcclxuICAgIHRoaXMuYW5jaG9yWCA9IHg7XHJcbiAgICB0aGlzLmFuY2hvclkgPSB5O1xyXG4gICAgdGhpcy54ID0gTWF0aC5yYW5kb20oKSAqICh4IC0gKHggLSBBTkNIT1JfTEVOR1RIKSkgKyAoeCAtIEFOQ0hPUl9MRU5HVEgpO1xyXG4gICAgdGhpcy55ID0gTWF0aC5yYW5kb20oKSAqICh5IC0gKHkgLSBBTkNIT1JfTEVOR1RIKSkgKyAoeSAtIEFOQ0hPUl9MRU5HVEgpO1xyXG4gICAgdGhpcy52eCA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcclxuICAgIHRoaXMudnkgPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XHJcbiAgICB0aGlzLmVuZXJneSA9IE1hdGgucmFuZG9tKCkgKiAxMDA7XHJcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICB0aGlzLnNpYmxpbmdzID0gW107XHJcbiAgICB0aGlzLmJyaWdodG5lc3MgPSAwO1xyXG4gIH1cclxuXHJcbiAgTm9kZS5wcm90b3R5cGUuZHJhd05vZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY29sb3IgPSBcInJnYmEoMzIsIDM4LCAxNzgsIFwiICsgdGhpcy5icmlnaHRuZXNzICsgXCIpXCI7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKFxyXG4gICAgICB0aGlzLngsXHJcbiAgICAgIHRoaXMueSxcclxuICAgICAgMiAqIHRoaXMucmFkaXVzICsgKDIgKiB0aGlzLnNpYmxpbmdzLmxlbmd0aCkgLyBTSUJMSU5HU19MSU1JVCxcclxuICAgICAgMCxcclxuICAgICAgY2lyY1xyXG4gICAgKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgfTtcclxuXHJcbiAgTm9kZS5wcm90b3R5cGUuZHJhd0Nvbm5lY3Rpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNpYmxpbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IFwicmdiYSgzMiwgMzgsIDE3OCwgXCIgKyB0aGlzLmJyaWdodG5lc3MgKyBcIilcIjtcclxuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICBjdHgubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgY3R4LmxpbmVUbyh0aGlzLnNpYmxpbmdzW2ldLngsIHRoaXMuc2libGluZ3NbaV0ueSk7XHJcbiAgICAgIGN0eC5saW5lV2lkdGggPSAxIC0gY2FsY0Rpc3RhbmNlKHRoaXMsIHRoaXMuc2libGluZ3NbaV0pIC8gU0VOU0lUSVZJVFk7XHJcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgTm9kZS5wcm90b3R5cGUubW92ZU5vZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVuZXJneSAtPSAyO1xyXG4gICAgaWYgKHRoaXMuZW5lcmd5IDwgMSkge1xyXG4gICAgICB0aGlzLmVuZXJneSA9IE1hdGgucmFuZG9tKCkgKiAxMDA7XHJcbiAgICAgIGlmICh0aGlzLnggLSB0aGlzLmFuY2hvclggPCAtQU5DSE9SX0xFTkdUSCkge1xyXG4gICAgICAgIHRoaXMudnggPSBNYXRoLnJhbmRvbSgpICogMjtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLnggLSB0aGlzLmFuY2hvclggPiBBTkNIT1JfTEVOR1RIKSB7XHJcbiAgICAgICAgdGhpcy52eCA9IE1hdGgucmFuZG9tKCkgKiAtMjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnZ4ID0gTWF0aC5yYW5kb20oKSAqIDQgLSAyO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnkgLSB0aGlzLmFuY2hvclkgPCAtQU5DSE9SX0xFTkdUSCkge1xyXG4gICAgICAgIHRoaXMudnkgPSBNYXRoLnJhbmRvbSgpICogMjtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLnkgLSB0aGlzLmFuY2hvclkgPiBBTkNIT1JfTEVOR1RIKSB7XHJcbiAgICAgICAgdGhpcy52eSA9IE1hdGgucmFuZG9tKCkgKiAtMjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnZ5ID0gTWF0aC5yYW5kb20oKSAqIDQgLSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnggKz0gKHRoaXMudnggKiB0aGlzLmVuZXJneSkgLyAxMDA7XHJcbiAgICB0aGlzLnkgKz0gKHRoaXMudnkgKiB0aGlzLmVuZXJneSkgLyAxMDA7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdE5vZGVzKCkge1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgbm9kZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSBERU5TSVRZOyBpIDwgY2FudmFzLndpZHRoOyBpICs9IERFTlNJVFkpIHtcclxuICAgICAgZm9yICh2YXIgaiA9IERFTlNJVFk7IGogPCBjYW52YXMuaGVpZ2h0OyBqICs9IERFTlNJVFkpIHtcclxuICAgICAgICBub2Rlcy5wdXNoKG5ldyBOb2RlKGksIGopKTtcclxuICAgICAgICBOT0RFU19RVFkrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY0Rpc3RhbmNlKG5vZGUxLCBub2RlMikge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydChcclxuICAgICAgTWF0aC5wb3cobm9kZTEueCAtIG5vZGUyLngsIDIpICsgTWF0aC5wb3cobm9kZTEueSAtIG5vZGUyLnksIDIpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZFNpYmxpbmdzKCkge1xyXG4gICAgdmFyIG5vZGUxLCBub2RlMiwgZGlzdGFuY2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IE5PREVTX1FUWTsgaSsrKSB7XHJcbiAgICAgIG5vZGUxID0gbm9kZXNbaV07XHJcbiAgICAgIG5vZGUxLnNpYmxpbmdzID0gW107XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgTk9ERVNfUVRZOyBqKyspIHtcclxuICAgICAgICBub2RlMiA9IG5vZGVzW2pdO1xyXG4gICAgICAgIGlmIChub2RlMSAhPT0gbm9kZTIpIHtcclxuICAgICAgICAgIGRpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKG5vZGUxLCBub2RlMik7XHJcbiAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBTRU5TSVRJVklUWSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZTEuc2libGluZ3MubGVuZ3RoIDwgU0lCTElOR1NfTElNSVQpIHtcclxuICAgICAgICAgICAgICBub2RlMS5zaWJsaW5ncy5wdXNoKG5vZGUyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2YXIgbm9kZV9zaWJsaW5nX2Rpc3RhbmNlID0gMDtcclxuICAgICAgICAgICAgICB2YXIgbWF4X2Rpc3RhbmNlID0gMDtcclxuICAgICAgICAgICAgICB2YXIgcztcclxuICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IFNJQkxJTkdTX0xJTUlUOyBrKyspIHtcclxuICAgICAgICAgICAgICAgIG5vZGVfc2libGluZ19kaXN0YW5jZSA9IGNhbGNEaXN0YW5jZShub2RlMSwgbm9kZTEuc2libGluZ3Nba10pO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGVfc2libGluZ19kaXN0YW5jZSA+IG1heF9kaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICBtYXhfZGlzdGFuY2UgPSBub2RlX3NpYmxpbmdfZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgIHMgPSBrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhfZGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUxLnNpYmxpbmdzLnNwbGljZShzLCAxKTtcclxuICAgICAgICAgICAgICAgIG5vZGUxLnNpYmxpbmdzLnB1c2gobm9kZTIpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVkcmF3U2NlbmUoKSB7XHJcbiAgICByZXNpemVXaW5kb3coKTtcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICAgIGZpbmRTaWJsaW5ncygpO1xyXG4gICAgdmFyIGksIG5vZGUsIGRpc3RhbmNlO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IE5PREVTX1FUWTsgaSsrKSB7XHJcbiAgICAgIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgZGlzdGFuY2UgPSBjYWxjRGlzdGFuY2UoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgeDogbW91c2UueCxcclxuICAgICAgICAgIHk6IG1vdXNlLnksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBub2RlXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChkaXN0YW5jZSA8IE1PVVNFX1JBRElVUykge1xyXG4gICAgICAgIG5vZGUuYnJpZ2h0bmVzcyA9IDEgLSBkaXN0YW5jZSAvIE1PVVNFX1JBRElVUztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlLmJyaWdodG5lc3MgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgTk9ERVNfUVRZOyBpKyspIHtcclxuICAgICAgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICBpZiAobm9kZS5icmlnaHRuZXNzKSB7XHJcbiAgICAgICAgbm9kZS5kcmF3Tm9kZSgpO1xyXG4gICAgICAgIG5vZGUuZHJhd0Nvbm5lY3Rpb25zKCk7XHJcbiAgICAgIH1cclxuICAgICAgbm9kZS5tb3ZlTm9kZSgpO1xyXG4gICAgfVxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhd1NjZW5lKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRIYW5kbGVycygpIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcmVzaXplV2luZG93LCBmYWxzZSk7XHJcbiAgICAvLyBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3VzZW1vdmVIYW5kbGVyLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNpemVXaW5kb3coKSB7XHJcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiAxNDAwKSB7XHJcbiAgICAgIGNhbnZhcy53aWR0aCA9ICQoXCIuaGVyb19fYW5pbVwiKS53aWR0aCgpO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gJChcIi5oZXJvX19hbmltXCIpLmhlaWdodCgpICogMS41O1xyXG4gICAgfSBlbHNlIGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDk5Mikge1xyXG4gICAgICBjYW52YXMud2lkdGggPSAkKFwiLmhlcm9fX2FuaW1cIikud2lkdGgoKTtcclxuICAgICAgY2FudmFzLmhlaWdodCA9ICQoXCIuaGVyb19fYW5pbVwiKS5oZWlnaHQoKSAqIDEuODtcclxuICAgIH0gZWxzZSBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA2MDApIHtcclxuICAgICAgY2FudmFzLndpZHRoID0gJChcIi5oZXJvX19hbmltXCIpLndpZHRoKCk7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSAkKFwiLmhlcm9fX2FuaW1cIikuaGVpZ2h0KCkgKiAxLjc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgcGFyZW50V2lkdGggPSAkKFwiLmhlcm9fX2FuaW1cIikud2lkdGgoKSAtIDUwO1xyXG5cclxuICAgICAgLy8gY2FudmFzLndpZHRoID0gcGFyZW50V2lkdGg7XHJcbiAgICAgIC8vIGNhbnZhcy5oZWlnaHQgPSBwYXJlbnRXaWR0aDtcclxuICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDEuMDI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb3VzZW1vdmVIYW5kbGVyKGUpIHtcclxuICAgIG1vdXNlLnggPSBlLmNsaWVudFg7XHJcbiAgICBtb3VzZS55ID0gZS5jbGllbnRZO1xyXG4gIH1cclxuXHJcbiAgaW5pdEhhbmRsZXJzKCk7XHJcbiAgaW5pdE5vZGVzKCk7XHJcbiAgcmVkcmF3U2NlbmUoKTtcclxufVxyXG5oZXJvQW5pbSgpO1xyXG4kKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcclxuICBoZXJvQW5pbSgpO1xy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
