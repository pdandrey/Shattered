"use strict";

Shattered.Party = (function() {
	
	var activeParty = [];
	
	function addPartyMember(member) {
		var idx = indexOf(member.Name);
		
		if(idx !== -1)
			throw "Member " + member.Name + " already exists in the active party";
			
		member.Type = "party";
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
			if(activeParty[idx].Name === name) {
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
		Clear: function() { activeParty.length = 0; }
	}
	
	return party;

})();

Shattered.Objects.Mob = (function() {

	var ret = Object.extend({
		init: function(mob) {
			var soulSet = null;
			
			Object.defineProperty(this, "Name", { value: mob.Name, writable: false, enumerable: true });
			Object.defineProperty(this, "Gender", { value: mob.Gender, writable: false, enumerable: true });
			Object.defineProperty(this, "SoulSet", { get: getSoulSet, set: setSoulSet, enumerable: true });
			
			if(mob.Stats)
				this.baseStats = Shattered.Objects.Stats.CopyFrom(mob.Stats);
			else
				this.baseStats = new Shattered.Objects.Stats();
				
			this.ready = 0;
			this.Type = "Mob";
			
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
			
			function setSoulSet() {
				soulSet = arguments[0];
				this.stats = new Shattered.Objects.Stats();
			}
			
			function getSoulSet() {
				return soulSet;
			}
			
			if(mob.SoulSet)
				this.SoulSet = mob.SoulSet;
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
	ret.Load = function(mob) {
		console.log("Loading %o", mob);
		var m = new ret(mob);
		
		m.Type = mob.Type;
		
		var soulset = Shattered.SoulSets[mob.SoulSet.Name.replace(/ /, "")].create();
		soulset.MainSoul = Shattered.Souls[mob.SoulSet.Main];
		if(mob.SoulSet.Subs) {
			var subsouls = [];
			for(var i=0; i<mob.SoulSet.Subs.length; ++i)
				subsouls.push(Shattered.Souls[mob.SoulSet.Subs[i]]);
			soulset.SubSouls = subsouls;
		}
		
		var powers = [Shattered.Powers.Attack];
		if(mob.Powers) {
			for(var i=0; i<mob.Powers.length; ++i) {
				powers.push(Shattered.Powers[mob.Powers[i]]);
			}
		}
		
		soulset.Powers = powers;
		m.SoulSet = soulset;
		
		for(var stat in mob.Stats) {
			m.baseStats[stat] = mob.Stats[stat];
		}
		
		return m;
	}
	return ret;
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

Shattered.Objects.Stats = (function() {
	var stats = {
		Strength: 		{ Name: 'Strength', Maximum: 25, Minimum: 1 },
		Agility: 		{ Name: 'Agility', Maximum: 25, Minimum: 1 },
		Vitality: 		{ Name: 'Vitality', Maximum: 25, Minimum: 1 },
		Intelligence: 	{ Name: 'Intelligence', Maximum: 25, Minimum: 1 },
		Mind: 			{ Name: 'Mind', Maximum: 25, Minimum: 1 },
		Charisma: 		{ Name: 'Charisma', Maximum: 25, Minimum: 1 },
		HP: 			{ Name: 'HP', Maximum: 999, Minimum: 1 },
		Speed: 			{ Name: 'Speed', Maximum: 50, Minimum: 10 },
		Range: 			{ Name: 'Range', Maximum: 10, Minimum: 1 }
	}
	
	function setStat(key, value, values, allowOver) {
		if(value < stats[key].Minimum)
			throw key + " " + value + " is below the minimum of " + stats[key].Minimum;
		if(!allowOver && value > stats[key].Maximum)
			throw key + " " + value + " is above the maximum of " + stats[key].Maximum;
		values[key] = value;
	}
	
	var ret = Object.extend({
		init: function(allowOver) {
			var values = {};
			
			for(var s in stats) {
				Object.defineProperty(this, s, { 
					get: (function() { var key = s; return function() { return values[key]; }; })(), 
					set: (function() { var key = s; return function(value) { setStat(key, value, values, allowOver); }; })(), 
					enumerable: true 
				});
				values[s] = stats[s].Minimum;
			}
		},
		toString: function() {
			var ret = "";
			for(var s in stats) {
				ret += s + ": " + this[s] + "\n";
			}
			return ret;
		}
	});
	ret.CopyFrom = function(stat, allowOver) {
		var newStat = new ret(allowOver);
		for(var s in stat) {
			newStat[s] = stat[s];
		}
		return newStat;
	}
	return ret;
})();

