"use strict";

Shattered.Party = (function() {
	
	var activeParty = [];
	
	function addPartyMember(member) {
		var idx = indexOf(member.name);
		
		if(idx !== -1)
			throw "Member " + member.name + " already exists in the active party";
			
		member.type = "party";
		activeParty.push(member);
	}
	
	function removePartyMember(name) {
		var idx = indexOf(name);
		if(idx === -1)
			return;
		activeParty.splice(idx, 1);
	}
	
	function battleOver(lstMonsters) {
		console.log("Unimplemented Method: battleOver");
	}
	
	function getPartyMember(name) {
		if(!name)
			return activeParty.concat();
		
		var idx = indexOf(name);
		
		if(idx === -1)
			return null;
		
		return activeParty[idx];
	}
	
	function indexOf(name) {
		var idx = 0;
		for(; idx < activeParty.length; ++idx) {
			if(activeParty[idx].name === name) {
				return idx;
			}
		}
		
		return -1;
	}
	
	var party = {
		Add: addPartyMember,
		Remove: removePartyMember,
		Get: getPartyMember,
		BattleOver: battleOver,
	}
	
	return party;

})();

Shattered.Objects.Mob = (function() {

	function setSoulSet() {
		this.__soulSet = arguments[0];
		this.stats = new Shattered.Objects.Stats();
	}
	
	function getSoulSet() {
		return this.__soulSet;
	}

	return Object.extend({
		init: function(name, gender, initialSoul) {
			
			Object.defineProperty(this, "name", { value: name, writable: false, enumerable: true });
			Object.defineProperty(this, "gender", { value: gender, writable: false, enumerable: true });
			Object.defineProperty(this, "soulSet", { get: getSoulSet, set: setSoulSet, enumerable: true });
			
			this.baseStats = new Shattered.Objects.Stats();
			this.ready = 0;
			this.type = "Mob";
			this.soulSet = initialSoul;
			
			this.equipment = {
				body: null,
				head: null,
				hands: null,
				legs: null,
				feet: null,
				main: null,
				offhand: null
			};
			
			this.buffs = []; // [ { expires: get # of rounds, undo: fnUndo(mob), tick: fnTick(mob) } ]
		},
		
		ticksTillTurn: function(turn) {
			return Math.ceil((100 - this.ready + (100 * (turn - 1))) / this.stats.Speed);
		},
		
		tick: function(turns) {
			turns = turns || 1;
			this.ready = (this.ready + this.stats.Speed * turns);
			var ret = this.ready >= 100;
			this.ready %= 100;
			return ret ? this.ready : -1;
		},
		
		testTick: function(turns) {
			var ready = (this.ready + this.stats.Speed * turns) % 100;
			var last = turns === 1 ? this.ready : (this.ready + this.stats.Speed * (turns - 1)) % 100;
			var ret = ready < last;
			return ret ? ready + turns * 100 : -1;
		}
	});

})();

Shattered.Objects.Buff = Object.extend({
	init: function(name, expires) {},
	undo: function(mob) {},
	tick: function(mob) {}
});

Shattered.Objects.HP = Object.extend({
	init: function(max) {
		var current = max;
		
		Object.defineProperty(this, "isBloodied", { get: function() { return current <= (max / 2); }, enumerable: true });
		Object.defineProperty(this, "isDead", { get: function() { return current <= 0; }, enumerable: true });
		Object.defineProperty(this, "max", { get: function() { return max; }, set: function(newMax) { current = Math.min(newMax, current); max = newMax; }, enumerable: true });
		Object.defineProperty(this, "current", { get: function() { return current; }, enumerable: true });
		
		this.damage = function(damage) {
			if(damage > 0)
				current -= damage;
			return this.isDead;
		}
		
		this.heal = function(healing) {
			if(healing > 0)
				current = Math.min(max, Math.max(0, current) + healing);
			return this.isDead;
		}
	}
});

Shattered.Objects.Stats = Object.extend({
	init: function(str, con, dex, intel, wis, cha, hp, speed, range) {
		this.Strength = str || 0;
		this.Constitution = con || 0;
		this.Dexterity = dex || 0;
		this.Intelligence = intel || 0;
		this.Wisdom = wis || 0;
		this.Charisma = cha || 0;
		this.HP = hp || new Shattered.Objects.HP();
		this.DeathCounter = 3;
		this.Speed = speed || 5;
		this.Range = range || 5;
	}
});