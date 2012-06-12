"use strict";

Shattered.Party = (function() {
	
	var activeParty = [];
	
	function addPartyMember(member) {
		var idx = indexOf(member.name);
		
		if(idx !== -1)
			throw "Member " + member.name + " already exists in the active party";
			
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
		this.currentStats = {};
	}
	
	function getSoulSet() {
		return this.__soulSet;
	}

	return Object.extend({
		init: function(name, gender, isEnemy) {
			
			Object.defineProperty(this, "name", { value: name, writable: false, enumerable: true });
			Object.defineProperty(this, "gender", { value: gender, writable: false, enumerable: true });
			Object.defineProperty(this, "hp", { value: new HP(0), writable: false, enumerable: true });
			Object.defineProperty(this, "soulSet", { get: getSoulSet, set: setSoulSet, enumerable: true });
			Object.defineProperty(this, "type", { value: isEnemy ? "Enemy" : "PartyMember", writable: false, enumerable: true });
			
			this.baseStats = new Shattered.Objects.Stats();
			
			setSoulSet(null);
			
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
		}
	});

})();

Shattered.Objects.Buff = Object.extend({
	init: function(name, expires, ) {},
	undo: function(mob) {},
	tick: function(mob) {}
});

Shattered.Objects.HP = (function() {
	
	function isBloodied() {
		return this.current <= (this.max / 2);
	}
	
	function isDead() {
		return this.current <= 0;
	}
	
	function takeDamage(damage) {
		if(damage > 0)
			this.current -= damage;
		return this.isDead;
	}
	
	function takeHealing(healing) {
		if(healing > 0)
			this.current = Math.min(this.max, this.current + healing);
		return this.isDead;
	}
	
	return Object.extend({
		init: function(max) {
			this.max = max,
			this.current = current;
			
			Object.defineProperty(this, "isBloodied", { get: isBloodied, enumerable: true });
			Object.defineProperty(this, "isDead", { get: isDead, enumerable: true });
		},
		damage: takeDamage,
		heal: takeHealing
	});
})();

Shattered.Objects.Stats = (function()
	
	return Object.extend({
		init: function(str, con, dex, intel, wis, cha, hp) {
			this.Strength = str || 0;
			this.Constitution = con || 0;
			this.Dexterity = dex || 0;
			this.Intelligence = intel || 0;
			this.Wisdom = wis || 0;
			this.Charisma = cha || 0;
			this.HP = hp || 0;
			this.DeathCounter = 3;
		}
	});
)();