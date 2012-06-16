"use strict";

Array.prototype.binarySearch = function(value, compare){
    var high = this.length;
	var	low = -1;
	var middle;
    while(high - low > 1) {
		middle = high + low >> 1;
		var diff = compare(this[middle], compare);
        if(diff < 0) low = middle;
        else high = middle;
	}
    return this[high] != value ? ~high : high;
};


function(find, comparator) {
	// modified from http://www.dweebd.com/javascript/binary-search-an-array-in-javascript/
  var low = 0, high = this.length - 1,
      i, comparison;
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    comparison = comparator(this[i], find);
    if (comparison < 0) { 
		low = i + 1; 
	} else if (comparison > 0) { 
		high = i - 1; 
	} else {
		return i;
	}
  }
  return ~(i+1);
};

Shattered.Pathing.AStar = (function() {
	
	var Node = Object.extend({
		init: function(/** me.Vector2d */ location, /** me.Vector2d */ destination, /** Node */ parent, /** int */ cost) {
			Object.defineProperty(this, "location", { value: location, enumerable: true });
			Object.defineProperty(this, "destination", { value: destination, enumerable: true });
			Object.defineProperty(this, "total", { get: function() { return this.cost + this.distance; }, enumerable: true });
			
			var dist = location.distance(destination);
			Object.defineProperty(this, "distance", { value: dist, enumerable: true });
			
			this.parent = parent;
			this.cost = (cost || 1) + (parent ? 0 : parent.total);
		},
		
		getHashCode: function() {
			return me.game.currentLevel.width * this.location.x + this.location.y;
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
	Node.Compare = function(self, other) {
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
	
	function Path(/** me.Vector2d */ start, /** me.Vector2d */ destination) {
		lstOpenNodes = [];
		setClosedNodes = {};
		stackDirections = [];
		
		var destinationFound = false;
		
		var tileTester = me.game.me.game.getEntityByName("tiletester");
		if(tileTester.length === 0) {
			tileTester = new me.InvisibleEntity(0, 0, { name: 'tileTester', collidable: true });
			me.game.addEntity(tileTester, 0);
		} else {
			tileTester = tileTester[0];
		}
		
		lstOpenNodes.push(new Node(start, destination));
		
		var current = null;
		
		while(!destinationFound && lstOpenNodes.length > 0) {
			
			current = GetLowestOpenNode();
			
			if(current.distance < 1) {
				destinationFound = true;
				break;
			}
			
			var scan = [];
			var velocity = new me.Vector2d(1, 1);
			for(var x = Math.max(0, start.x-1); x < Math.min(me.game.currentLevel.width, start.x+1); ++x) {
				for(var y = Math.max(0, start.y-1); y < Math.min(me.game.currentLevel.height, start.y+1); ++y) {
					// is the tlie location valid?
					var loc = new me.Vector2d(x, y);
					tileTester.pos.setV(loc.toXY());
					
					// is the tile already been visited?
					if(!setClosedNodes[tileTester.pos.toString()]) {						
						// test collision with the map
						var collision = me.game.collisionMap.checkCollision(tileTester.collisionBox, velocity);
						if(!(collision && ( (collision.xprop && collision.xprop.isSolid) || (collision.yprop && collision.isSolid)))) {
							// it's not a solid tile.  Is there something standing in the way?
							collision = me.game.collide(tileTester);
							if(!collision) {
								// it's a free tile
								AddOpenNode(new Node(loc, destination, current, start.loc));
							} else {
								// something is there.
								setClosedNodes[tileTester.pos.toString()] = "entity";
							}
						} else {
							// solid tile.  close the node
							setClosedNodes[tileTester.pos.toString()] = "solid";
						}
					} 
				}
			}
		
			lstOpenNodes = [];
			setClosedNodes = {};
			
			if(destinationFound) {
				while(current != null) {
					stackDirections.push(current);
					current = current.parent;
				}
				return stackDirections;
			}
			
			return null;
		}
	}
	
	function AddOpenNode(node)
	{
		int index = lstOpenNodes.binarySearch(node, Node.Compare);
		if(index < 0)
		{
			index = ~index;
			lstOpenNodes.splice(index, 0, node);
		}
		else if(node.location.toString() === lstOpenNodes[index].location.toString())
		{
			var existing = lstOpenNodes[index];
			if(node.Cost < existing.Cost)
			{
				lstOpenNodes[index] = node;
			}
		}
		else
		{
			lstOpenNodes.splice(index, 0, node);
		}
	}
	
	function GetLowestOpenNode()
	{
		var ret = lstOpenNodes[0];
		lstOpenNodes.shift();
		setClosedNodes[ret.location.toString()] = true;
		return ret;
	}
)();