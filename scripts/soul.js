"use strict";

Shattered.Powers = (function() {

	function execute(source, target) {
		throw "Unimplemented Method: Shattered.Objects.Power.execute()";
	}

	var power = Object.extend({
		init: function(name, level, type, target, effects, range, size, statMods, damageMultiplier, fnExecute, requires) {
			this.level = level;
			this.name = name;
			this.type = type;
			this.target = target;
			this.effects = effects;
			this.range = range; // null means weapon based
			this.size = size;
			this.Execute = fnExecute || execute;
			this.damageMultiplier = damageMultiplier;
			this.statMods = statMods; //[ [ StatName, Multiplier ] ]
			this.requires = requires; // [ [PowerName, Level] ]
		}
	});
	
	var powers = {
		Attack: new power(
			"Attack", 
			1,
			Shattered.Enums.Powers.Level.Basic,
			Shattered.Enums.Powers.Target.Enemy,
			Shattered.Enums.Powers.Target.Enemy,
			Shattered.Enums.Powers.Range.Weapon,
			0,
			null,
			1,
			null,
			null)
	};
	
	return powers;
})();

Shattered.Souls = (function() {
		
	var StatMod = Object.extend({
		init: function(name, mod) {
			Object.defineProperty(this, "Stat", { value: name, writable: false, enumerable: true });
			Object.defineProperty(this, "Modifier", { value: mod, writable: false, enumerable: true });
		}
	});
	
	var Soul = Object.extend({
		init: function(soul) {
			Object.defineProperty(this, "Name", { value: soul.Name, enumerable: true, writable: false });
			Object.defineProperty(this, "StatModifiers", { get: function() { return statMod.concat(); }, enumerable: true });
			Object.defineProperty(this, "Powers", {get : function() { return powers.concat(); }, enumerable: true });
			
			var statMod = [];
			for(var mod in soul.Modifiers) {
				statMod.push(new StatMod(mod, soul.Modifiers[mod]));
			}
			
			var powers = [];
			powers.push(Shattered.Powers.Attack);
		}
	});
	
	return {
		Warrior: new Soul({ Name: 'Warrior', Modifiers: { Strength: 1.25, Vitality: 1.2, HP: 1.05 } }),
		Engineer: new Soul({ Name: 'Engineer', Modifiers: { Vitality: 1.25, Intelligence: 1.3, Mind: 1.1, HP: 1.03 } }),
		Mage: new Soul({ Name: 'Mage', Modifiers: { Intelligence: 1.4, Mind: 1.2, Charisma: 1.1 } }),
		Thief: new Soul({ Name: 'Thief', Modifiers: { Strength: 1.05, Agility: 1.3, HP: 1.03 } }),
		
		Monsters: {
			Snake: new Soul({ Name: "Snake", Modifiers: null })
		}
	};
})();

Shattered.SoulSets = (function() {

	var PowerLimit = Object.extend({
		init: function(advanced, basic) {
			Object.defineProperty(this, "Advanced", { value: advanced, writable: false, enumerable: true });
			Object.defineProperty(this, "Basic", { value: basic, writable: false, enumerable: true });
		}
	});

	var SoulSetDefinition = Object.extend({
		init: function(set) {
			Object.defineProperty(this, "Name", { value: set.Name, writable: false, enumerable: true });
			Object.defineProperty(this, "SubSouls", { value: set.SubSouls, writable: false, enumerable: true });
			Object.defineProperty(this, "MainPowerLimit", { value: new PowerLimit(set.Main.Advanced, set.Main.Basic), writable: false, enumerable: true});
			Object.defineProperty(this, "SubPowerLimit", { value: new PowerLimit(set.Sub.Advanced, set.Sub.Basic), writable: false, enumerable: true});
			Object.defineProperty(this, "StringFormat", { value: set.Format, writable: false, enumerable: true});
		},
		create: function(main, subs, powers) {
			var ret = new soulset(this);
			if(main) {
				ret.MainSoul = main;
				ret.SubSouls = subs;
				ret.Powers = powers || [];
			}
			return ret;
		}
	});

	var sets = {
		FocusedPath: new SoulSetDefinition({ Name: 'Focused Path', SubSouls: 0, Main: { Basic: null, Advanced: null }, Sub: { Basic: null, Advanced: null }, Format: '{MAINSOUL}' })
	}

	var soulset = Object.extend({
		init: function(set) {
			Object.defineProperty(this, "SoulSet", { value: set, writable: false, enumerable: true });
			Object.defineProperty(this, "MainSoul", { 
				get: function() { return mainSoul; }, 
				set: function(value) { mainSoul = value; powers.length = 0; }, 
				enumerable: true 
			});
			Object.defineProperty(this, "SubSouls", { 
				get: function() { return subSouls.concat(); }, 
				set: function(sub) {
					if(!sub) {
						subSouls = [];
						return;
					}
					if(sub.length > this.SoulSet.subSouls)
						throw "Invalid number of sub souls";
					subSouls = sub.concat();
					powers.length = 0;
				},
				enumerable: true
			});
			Object.defineProperty(this, "Powers", {
				get: function() { return powers.concat(); },
				set: function(arrPowers) {
					var mainAdv = 0, mainBasic = 0;
					var subAdv = 0, subBasic = 0;
					var set = this.SoulSet;
					
					for(var i=0; i<arrPowers.length; ++i) {
						if(arrPowers[i] === Shattered.Powers.Attack)
							continue;
							
						var idx = mainSoul.Powers.indexOf(arrPowers[i]);
						if(idx !== -1) {
							if(arrPowers[i].level === Shattered.Enums.Powers.Level.Basic) {
								++mainBasic;
							} else {
								++mainAdv;
							}
						} else if(subSouls && subSouls.length > 0) {
							for(var j=0; j<subSouls.length; ++j) {
								idx = subSouls[j].Powers.indexOf(arrPowers[i]);
								if(idx !== -1) {
									if(arrPowers[i].level === Shattered.Enums.Powers.Level.Basic) {
										++subBasic;
									} else {
										++subAdv;
									}
									break;
								}
							}
						} else {
							throw "Power " + arrPowers[i].name + " is not one of the set soul powers.";
						}
					}
					
					if(set.MainPowerLimit.Advanced && mainAdv > set.MainPowerLimit.Advanced)
						throw "Too many main advanced powers";
					if(set.MainPowerLimit.Basic && mainBasic > set.MainPowerLimit.Basic)
						throw "Too many main basic powers";
					if(set.SubPowerLimit.Advanced && subAdv > set.SubPowerLimit.Advanced)
						throw "Too many sub advanced powers";
					if(set.SubPowerLimit.Basic && subBasic > set.SubPowerLimit.Basic)
						throw "Too many sub basic powers";
					
					powers = arrPowers.concat([Shattered.Powers.Attack]);
				}
			});
			
			var mainSoul = null;
			var subSouls = [];
			
			var powers = [];
		},
		toString: function() {
			return this.SoulSet.StringFormat.replace(/{MAINSOUL}/, mainSoul.Name);
		},
		getStatMod: function(baseStats) {
			var mod = this.MainSoul.StatModifiers;
			var ret = Shattered.Objects.Stats.copyFrom(baseStats);
			
			for(var i=0; i<mod.length; ++i) {
				ret[mod[i].Name] *= mod[i].Modifier;
			}
			
			return ret;
		}
	});

	return sets;
})();