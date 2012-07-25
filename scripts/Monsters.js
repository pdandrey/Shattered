"use strict";

Shattered.Monsters = (function() {
	
	return {
		Snake: new Shattered.Objects.Mob({
			Name: "Snake", 
			Gender: 0, 
			SoulSet: Shattered.SoulSets.FocusedPath.create(Shattered.Souls.Monsters.Snake),
			Stats: {
				Strength: 5,
				Agility: 8,
				Speed: 10,
				Range: 3,
				HP: 15,
				Intelligence: 3,
				Vitality: 5,
				Wisdom: 3,
				Charisma: 3
			}
		})
	};
})();