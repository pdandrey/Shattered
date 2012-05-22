Shattered.Story = (function() {
	
	function onLevelLoaded(levelID) {
		/*
		var func = Shattered.Levels.OnLevelLoaded[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene];
		if(func) {
			func(levelId);
		}
		Shattered.Levels.Utility.loadDialog();
		*/
	}
	
	function onNpcAction(npc) {
		
	}
	
	var ret = {
		onLevelLoaded: onLevelLoaded,
		onNpcAction: onNpcAction,
		Episode: Shattered.Enums.Episodes.Prologue,
		Scene: 1
	};
	
	return ret;
	
})();