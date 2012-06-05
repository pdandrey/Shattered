Shattered.Levels = {
	OnLevelLoaded: {
		Prologue: {
			Scene1: {}
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