"use strict";

Array.prototype.binarySearch = function(value, compare){
    var high = this.length;
	var	low = -1;
	var middle;
    while(high - low > 1) {
		middle = high + low >> 1;
		var diff = compare(this[middle], value);
        if(diff < 0) low = middle;
        else high = middle;
	}
    return this[high] != value ? ~high : high;
};

Shattered.Pathing.AStar = (function() {
	
	var Node = Object.extend({
		init: function(/** me.Vector2d */ location, /** me.Vector2d */ destination, /** Node */ parent, /** int */ cost) {
			Object.defineProperty(this, "location", { value: location, enumerable: true });
			Object.defineProperty(this, "destination", { value: destination, enumerable: true });
			Object.defineProperty(this, "total", { get: function() { return this.cost + this.distance; }, enumerable: true });
			Object.defineProperty(this, "hashCode", { value: me.game.currentLevel.width * this.location.x + this.location.y, enumerable: true });
			var dist = location.distance(destination);
			Object.defineProperty(this, "distance", { value: dist, enumerable: true });
			
			this.parent = parent;
			this.cost = (cost || 1) + (parent ? parent.total : 0);
			this.aaa = location.x + ", " + location.y;
		},
		
		toString: function() {
			function loc(v) {
				if(v)
					return "(" + v.x + "," + v.y + ")"
				else
					return "";
			}
		
			var ret = [];
			ret.push(loc(this.location));
			ret.push("Cost " + this.cost);
			ret.push("Dist " + this.distance);
			ret.push("Total " + this.total);
			ret.push("Parent " + this.parent ? "" : loc(this.parent.location));
			return ret.join(" ");
		}
	});
	Node.TotalCompare = function(self, other) {
		return self.total - other.total;
	}
	
	Shattered.Objects.TileTester = me.InvisibleEntity.extend({
		init: function(x, y, settings) {
			settings = settings || {};
			settings.collidable = false;
			settings.name = 'tiletester';
			this.parent(x, y, settings);
			this.collidable = false;
			//this.collisionBox.width = me.game.currentLevel.tilewidth;
			//this.collisionBox.height = me.game.currentLevel.tileheight;
			this.updateColRect(4, 26, 4, 26);
		}, 
		showPath: function(path, timeout) {
			var idx = 0;
			var ttInterval = setInterval(setTT, timeout || 1000);
			var self = this;
			
			function setTT() {
				if(idx >= path.length) {
					clearInterval(ttInterval);
					return;
				}
				self.pos.setV(me.Vector2d.toXY(path[idx].x, path[idx].y));
				++idx;
			}
		}
	});
	
	var lstOpenNodes = [];
	var setClosedNodes = {};
	var setSolidNodes = {};
	var setEntityNodes = {};
	var tileTester = null;
	var velocity = null;
	
	function Path(/** me.ObjectEntity */ obj, /** me.Vector2d */ destination, /* Int */ distance) {
		console.time("A*");
		var start = me.Vector2d.toTile(obj.collisionBox.left, obj.collisionBox.top)
		destination = destination.toTile();
		
		console.log("Pathing from %s to %s", start.toString(), destination.toString());
		lstOpenNodes = [];
		setClosedNodes = {};
		
		setEntityNodes = {};
			
		distance = distance || 1; //me.game.currentLevel.tilewidth / 2;
		
		var destinationFound = false;
		
		tileTester = me.game.getEntityByName("tiletester");
		if(tileTester.length === 0) {
			tileTester = new Shattered.Objects.TileTester(0, 0, { });
			me.game.add(tileTester, me.game.currentLevel.objectGroups[0].z);
		} else {
			tileTester = tileTester[0];
		}
		
		lstOpenNodes.push(new Node(start, destination));
		
		var current = null;
		
		var loopMax = 10000;
		var loop = 0;
		velocity = obj.maxVel;
		
		while(!destinationFound && lstOpenNodes.length > 0) {
			
			if(loop > loopMax) {
				console.log("loop max reached");
				console.timeEnd("A*");
				return null;
			}
			
			++loop;
			
			current = GetLowestOpenNode();
			
			if(current.distance < distance) {
				destinationFound = true;
				break;
			}
			
			var scan = scanAdjacent(current);
			
			while(scan.length > 0) {
				var loc = scan.pop();
				
				var lookingAt = new Node(loc, destination, current, 1);
				
				// is the tile already been visited?
				var isClosed = setClosedNodes[loc.toString()];
				
				if(isClosed) {		
					// We've been here before, but is the new value lower?
					if(lookingAt.total < isClosed.total) {
						isClosed.cost = lookingAt.cost;
						isClosed.parent = lookingAt.parent;
					}
				} else {
					// is it in the open list?
					var openNode = ScanOpenForNode(lookingAt);
					
					if(openNode) {
						if(lookingAt.total < openNode.total) {
							openNode.cost = lookingAt.cost;
							openNode.parent = lookingAt.parent;
						}
					} else {
						lstOpenNodes.push(lookingAt);
						lstOpenNodes.sort(Node.TotalCompare);
					}
				}
			}
		}
		
		lstOpenNodes = [];
		setClosedNodes = {};
		var stackDirections = [];
		
		if(destinationFound) {
			while(current != null) {
				stackDirections.push(current.location.toXY());
				current = current.parent;
			}
			console.timeEnd("A*");
			//stackDirections.pop();
			return stackDirections.reverse();
		}
		
		console.log("Destination not found");
		console.timeEnd("A*");
		return null;
	}
	
	function removeAdjacent(scan, d) {
		if(d.length === 1) {
			switch(d) {
				case "n":
				case "s":
					scan[d + "e"] = null;
					scan[d + "w"] = null;
					break;
					
				case "e":
				case "w":
					scan["n" + d] = null;
					scan["s" + d] = null;
			}
		}
	}
	
	function scanAdjacent(current) {
		var nodes = [];
		var ns = [];
		var ew = [];
		
		// is the tlie location valid?
		var loc = new me.Vector2d(current.location.x, current.location.y-1);
		if(test(loc)) {
			nodes.push(loc);
			ns.push("n");
		}
		
		loc = new me.Vector2d(current.location.x, current.location.y+1);
		if(test(loc)) {
			nodes.push(loc);
			ns.push("s");
		}
		loc = new me.Vector2d(current.location.x-1, current.location.y);
		if(test(loc)) {
			nodes.push(loc);
			ew.push("w");
		}
		loc = new me.Vector2d(current.location.x+1, current.location.y);
		if(test(loc)) {
			nodes.push(loc);
			ew.push("e");
		}
		
		// console.log("%s, %s", ns.join(", "), ew.join(", "));
		
		var corners = {
			nw: new me.Vector2d(current.location.x-1, current.location.y-1),
			ne: new me.Vector2d(current.location.x+2, current.location.y-1),
			sw: new me.Vector2d(current.location.x-1, current.location.y+1),
			se: new me.Vector2d(current.location.x+1, current.location.y+1)
		}
		
		// if(ns.length > 0 && ew.length > 1) {
			// for(var x = 0; x < ew.length; ++x) {
				// for(var y=0; y<ns.length; ++y) {
					// if(test(corners[ns[y] + ew[x]])) {
						// nodes.push(corners[ns[y] + ew[x]]);
						// console.log(ns[y] + ew[x]);
					// }
				// }
			// }
		// }
		
		return nodes;
		
		function test(loc) {
			if(setSolidNodes[loc.toString()] || setEntityNodes[loc.toString()]) {
				// this is a known solid node
				return false;
			}
			
			// test collision with the map
			tileTester.pos.setV(loc.toXY());
			var collision = me.game.collisionMap.checkCollision(tileTester.collisionBox, velocity);
			if(!(collision && ( (collision.xprop && collision.xprop.isSolid) || (collision.yprop && collision.isSolid)))) {
				// it's not a solid tile.  Is there something standing in the way?
				collision = me.game.collide(tileTester);
				if(!collision) {
					// it's a free tile
					return true;
				} else {
					// something is there.
					setEntityNodes[loc.toString()] = "entity";
					return false;
				}
			} else {
				// solid tile.  close the node
				setSolidNodes[loc.toString()] = "solid";
				return false;
			}
		}
			
	}
	
	function AddOpenNode(node)
	{
		var index = lstOpenNodes.binarySearch(node, Node.Compare);
		if(index < 0)
		{
			index = ~index;
			lstOpenNodes.splice(index, 0, node);
			console.log("Inserting node %s at %d", node.toString(), index);
		}
		else if(node.location.toString() === lstOpenNodes[index].location.toString())
		{
			var existing = lstOpenNodes[index];
			if(node.Cost < existing.Cost)
			{
				lstOpenNodes[index] = node;
			}
			console.log("Updating node %s at index %d", node.toString(), index);
		}
		else
		{
			lstOpenNodes.splice(index, 0, node);
			console.log("something else");
		}
		console.log("open: %o", lstOpenNodes);
	}
	
	function GetLowestOpenNode()
	{
		var ret = lstOpenNodes[0];
		lstOpenNodes.shift();
		if(setClosedNodes[ret.location.toString()]) {
			throw ret.location.toString() + " has been visited already";
		}
		
		setClosedNodes[ret.location.toString()] = "visited";
		return ret;
	}
	
	function ScanOpenForNode(node) {
		for(var i=0; i<lstOpenNodes.length; ++i) {
			if(node.hashCode == lstOpenNodes[i].hashCode)
				return lstOpenNodes[i];
		}
		return null;
	}
	
	return Path;
})();