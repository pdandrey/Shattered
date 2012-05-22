Shattered.Levels = {
	OnLevelLoaded: {
		Prologue: {
			Scene1: function(levelID) {
				var clair = new Shattered.Objects.Clair(4 * Shattered.Settings.tileSize, 42 * Shattered.Settings.tileSize, { name: "clair"});
				var doug = new Shattered.Objects.NPC(6 * Shattered.Settings.tileSize, 42 * Shattered.Settings.tileSize, { name: "doug", pathkey: 'none' });
				
				var shepard = new Shattered.Objects.NPC(4 * Shattered.Settings.tileSize, 44 * Shattered.Settings.tileSize, { name: "shepard", velocity: 2 });
					
				var z = 7;
				me.game.add(clair, z);
				me.game.add(doug, z);
				me.game.add(shepard, z);
				
				for(var i=0; i<6; ++i)
					me.game.add(new Shattered.Objects.NPC((i + 1) * Shattered.Settings.tileSize, 45 * Shattered.Settings.tileSize, { name: 'sheep', pathkey: 'none', velocity: 2 }), z);
				
				
			}
		}
	},
	
	Utility: {
		loadDialog: function() {
			var dialog = Shattered.Game.Resources.dialog.Episodes[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene];
			if(dialog) {
				for(var key in dialog) {
					if(dialog[key].settings && dialog[key].settings.trigger == Shattered.Enums.DialogOptions.Trigger.OnLoad) {
						Shattered.Game.DialogController.setText(dialog[key]);
						return;
					}
				}
			}
		}
	}
}