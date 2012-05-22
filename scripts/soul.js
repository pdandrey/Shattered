Shattered.Objects.Power = (function() {

	function execute(source, target) {
		console.log("Unimplemented Method: Shattered.Objects.Power.execute()");
	}

	return Object.extend({
		init: function(name, level, type, target, effects, range, size, statMods, damageMultiplier, fnExecute, requires) {
			this.level = level;
			this.name = name;
			this.type = type;
			this.target = target;
			this.effects = effects;
			this.range = range; // -1 means weapon based
			this.size = size;
			this.Execute = fnExecute || execute;
			this.damageMultiplier = damageMultiplier;
			this.statMods = statMods; //[ [ StatName, Multiplier ] ]
			this.requires = requires; // [ [PowerName, Level] ]
		}
	});
	
})();

Shattered.Objects.Soul = (function() {
	var basicAttack = new ShatteredObjects.Power(
		"Attack", 
		Shattered.Enums.Powers.Level.Basic,
		Shattered.Enums.Powers.Target.Enemy,
		Shattered.Enums.Powers.Target.Enemy,
		Shattered.Enums.Powers.Range.Weapon,
		0,
		null,
		1,
		null,
		null);
	
	return Object.extend({
		init: function(name, statMod, powers) {
			this.name = name;
			this.statMod = statMod;
			this.powers = powers;
			powers.push(basicAttack);
		}
	});
})();

Shattered.Objects.SoulSet = (function() {
	
	return Object.extend({
		init: function(name, fnToString) {
			this.name = name;
			this.mainSoul = null;
			this.subSoulsAllowed = 0;
			this.subSouls = [];
			
			this.mainSoulPowerLimit = {
				AdvancedPowers: 0,
				BasicPowers: 0
			};
			
			this.subSoulPowerLimit = {
				AdvancedPowers: 0,
				BasicPowers: 0
			};
			
			this.toString = fnToString;
		},
		getStatMod: function(baseStats) {
			var mod = this.mainSoul.statMod;
			
			return new Shattered.Objects.Stats(
				baseStats.Strength * (1 + mod.Strength),
				baseStats.Constitution * (1 + mod.Constitution),
				baseStats.Dexterity * (1 + mod.Dexterity,
				baseStats.Intelligence * (1 + mod.Intelligence),
				baseStats.Wisdom * (1 + mod.Wisdom),
				baseStats.Charisma * (1 + mod.Charisma),
				baseStats.HP * (1 + mod.HP)
			);
		}
	});
})();



