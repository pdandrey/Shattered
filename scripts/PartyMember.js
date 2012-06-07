"use strict";

Shattered.Party = (function() {
	
	var activeParty = [];
	
	function addPartyMember(member) {
		console.log("Unimplemented Method: addPartyMember");
	}
	
	function removePartyMember(name) {
		console.log("Unimplemented Method: removePartyMember");
	}
	
	function battleOver(lstMonsters) {
		console.log("Unimplemented Method: battleOver");
	}
	
	function getPartyMember(name) {
		console.log("Unimplemented Method: getPartyMember");
	}
	
	var party = {
		Add: addPartyMember,
		Remove: removePartyMember,
		Get: getPartyMember,
		BattleOver: battleOver,
	}
	
	return party;

})();

Shattered.Objects.PartyMember = (function() {

	function setSoulSet() {
		this.__soulSet = arguments[0];
		this.currentStats = {};
	}
	
	function getSoulSet() {
		return this.__soulSet;
	}

	return Object.extend({
		init: function(name, gender) {
			
			Object.defineProperty(this, "name", { value: name, writable: false, enumerable: true });
			Object.defineProperty(this, "gender", { value: gender, writable: false, enumerable: true });
			Object.defineProperty(this, "hp", { value: new HP(0), writable: false, enumerable: true });
			Object.defineProperty(this, "soulSet", { get: getSoulSet, set: setSoulSet, enumerable: true });
			
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
			
			this.buffs = []; // [ { expires: # of rounds, fnUndo } ]
		},
	});

})();

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
		}
	});
)();