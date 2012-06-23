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
			
			this.parent(x, y, settings);
			this.updateColRect(4, 4, 26, 26);
		}
	});
	
	var lstOpenNodes = [];
	var setClosedNodes = {};
	var stackDirections = [];
	
	function Path(/** me.Vector2d */ start, /** me.Vector2d */ destination, /* Int */ distance) {
		console.log("Pathing from %s to %s", start.toString(), destination.toString());
		lstOpenNodes = [];
		setClosedNodes = {};
		var setInvalidNodes = {};
		
		distance = distance || 2;
		
		var destinationFound = false;
		
		var tileTester = me.game.getEntityByName("tiletester");
		if(tileTester.length === 0) {
			tileTester = new Shattered.Objects.TileTester(0, 0, { name: 'tileTester', collidable: true });
			me.game.addEntity(tileTester, me.game.currentLevel.objectGroups[0].z);
		} else {
			tileTester = tileTester[0];
		}
		
		lstOpenNodes.push(new Node(start, destination));
		
		var current = null;
		
		var loopMax = 30;
		var loop = 0;
		var velocity = new me.Vector2d(1, 1);
		
		while(!destinationFound && lstOpenNodes.length > 0) {
			
			if(loop > loopMax) {
				console.log("loop max reached");
				return null;
			}
			
			++loop;
			
			current = GetLowestOpenNode();
			
			console.log("Lowest Node: %s", current.aaa);
			
			if(current.distance < distance) {
				destinationFound = true;
				break;
			}
			
			for(var x = Math.max(0, start.x-1); x <= Math.min(me.game.currentLevel.width, start.x+1); ++x) {
				for(var y = Math.max(0, start.y-1); y <= Math.min(me.game.currentLevel.height, start.y+1); ++y) {
					
					if(x === current.location.x && y === current.location.y) {
						continue;
					}
					
					// is the tlie location valid?
					var loc = new me.Vector2d(x, y);
					
					if(setInvalidNodes[loc.toString()]) {
						// this is a known solid node
						continue;
					}
					
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
							// test collision with the map
							tileTester.pos.setV(loc.toXY());
							var collision = me.game.collisionMap.checkCollision(tileTester.collisionBox, velocity);
							if(!(collision && ( (collision.xprop && collision.xprop.isSolid) || (collision.yprop && collision.isSolid)))) {
								// it's not a solid tile.  Is there something standing in the way?
								collision = me.game.collide(tileTester);
								if(!collision) {
									// it's a free tile
									//console.log("free tile at %d, %d", loc.x, loc.y);
									lstOpenNodes.push(lookingAt);
									lstOpenNodes.sort(Node.TotalCompare);
								} else {
									// something is there.
									//console.log("entity collision");
									setInvalidNodes[loc.toString()] = "entity";
									//console.log("%s = entity", loc.toString());
								}
							} else {
								// solid tile.  close the node
								//console.log("solid collision");
								setInvalidNodes[loc.toString()] = "solid";
								//console.log("%s = solid", loc.toString());
							}
						}
					}
				}
			}
		}
		
		lstOpenNodes = [];
		setClosedNodes = {};
		setInvalidNodes = {};
		
		if(destinationFound) {
			while(current != null) {
				stackDirections.push(current);
				current = current.parent;
			}
			return stackDirections;
		}
		
		console.log("Destination not found");
		return null;
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