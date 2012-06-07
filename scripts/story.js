Shattered.Story = (function() {
	
	function onLevelLoaded(levelID) {
		switch(ret.Episode) {
			case Shattered.Enums.Episodes.Prologue: prologue(levelID); break;
		}
		
		/*
		var func = Shattered.Levels.OnLevelLoaded[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene];
		if(func) {
			func(levelId);
		}
		Shattered.Levels.Utility.loadDialog();
		*/
		
		function prologue(levelID) {
			if(levelID === 'prologue-augustun') {
				if(ret.Scene === 1) {
					console.log("starting scene 1 ");
					var clair = new Shattered.Objects.Clair(4 * Shattered.Settings.tileSize, 42 * Shattered.Settings.tileSize, { name: "clair"});
					var doug = new Shattered.Objects.NPC(6 * Shattered.Settings.tileSize, 42 * Shattered.Settings.tileSize, { name: "doug", pathkey: 'none' });
					var shepard = new Shattered.Objects.NPC(4 * Shattered.Settings.tileSize, 44 * Shattered.Settings.tileSize, { name: "shepard", velocity: 2 });
					
					var z = 7;
					me.game.add(clair, z);
					me.game.add(doug, z);
					me.game.add(shepard, z);
					
					for(var i=0; i<6; ++i)
						me.game.add(new Shattered.Objects.NPC((i + 1) * Shattered.Settings.tileSize, 45 * Shattered.Settings.tileSize, { name: 'sheep', pathkey: 'none', velocity: 2 }), z);
						
					var shepardDialog = new Shattered.Objects.FullDialog([
							{ portraitKey: "shepard", text: "Thanks for the help you two. My sheep are safe and I can't thank you enough." },
							{ portraitKey: "clair", text: "I'm not called the best for nothing.  Doug will send you th..." },
							{ portraitKey: "doug", text: "It was our pleasure.  Tomorrow Clair and I will go out and scout for a safer place for you to take them to graze." },
							{ portraitKey: "clair", text: "Doug!" },
							{ portraitKey: "doug", text: "*shrug*" },
							{ portraitKey: "shepard", text: "You two are too good to everyone here in Augustun.\n\nI need to get these guys and gals to their field before they run off." }
						], {count: 1, allowNpcMovement: false, trigger: Shattered.Enums.DialogOptions.Trigger.OnLoad, onFinish: function() {
							Shattered.Game.Control = Shattered.Enums.Control.Npc;
							shepard.path = function(npc) {
								var path = [
									{ x: 7 * Shattered.Settings.tileSize, y: null },
									{ x: 42.5 * Shattered.Settings.tileSize, y: null },
									{ x: null, y: 14 * Shattered.Settings.tileSize },
									{ x: 39.5 * Shattered.Settings.tileSize, y: null }
								];
								
								if(npc.pathIndex == 1 && !npc.sheepFollowing && npc.name === "shepard") {
									npc.sheepFollowing = true;
									var sheep = me.game.getEntityByName("sheep");
									for(var i=0; i<sheep.length; ++i) {
										sheep[i].path = shepard.path;
									}
									setTimeout(function() {
										npc.dougStarted = true;
										Shattered.Game.Dialog.setText(dougDialog, doug);
									}, 2000);	
								}
								
								if(!Shattered.Pathing.Global.movePath(npc, path)) {
									if(npc.pathIndex >= path.length) {
										if(npc.name === "shepard") {
											npc.path = Shattered.Pathing.Global.none;
										} else {
											npc.path = Shattered.Pathing.Global.random;
											npc.velocity = 1;
										}
									}
									return false;
								} else {
									return true;
								}
							};
						} });
						
					var dougDialog = new Shattered.Objects.FullDialog([
							{ portraitKey: "doug", text: "Wow, those were some crazy wolves huh?" },
							{ portraitKey: "clair", text: "I still don't know how you saw them." },
							{ portraitKey: "doug", text: "Luck I guess." },
							{ portraitKey: "doug", text: "I'm going to go check on Grandma. See you around Clair." }
						], {
							allowNpcMovement: true,
							count: 1, 
							trigger: Shattered.Enums.DialogOptions.Trigger.Scripted, 
							onFinish: function(npc) { 
								ret.Scene = 2;
								doug.path = function(npc) {
									var path = [
										{ x: 1312, y: null },
									{ x: null, y: 832 },
										{ x: 672, y: null },
										{ x: null, y: 320 },
										{ x: 272, y: null },
										{ x: null, y: 224}
									];
									
									if(!Shattered.Pathing.Global.movePath(npc, path)) {
										if(npc.pathIndex >= path.length) {
											npc.path = null;
											me.game.remove(npc);
										}
										return false;
									} else {
										return true;
									}
								}
							} 
						}
					);						
						
					Shattered.Game.Dialog.setText(shepardDialog, shepard);
				} else if(ret.Scene === 2) {
					
					var shepard = new Shattered.Objects.NPC(39.5 * Shattered.Settings.tileSize, 14 * Shattered.Settings.tileSize, { name: "shepard", velocity: 2, pathkey: 'none' });
					shepard.path = null;
					
					var z = 7;
					me.game.add(shepard, z);
					
					var usedXY = {};
					for(var x=40; x<=42; ++x)
						for(var y=6; y<=8; ++y)
							usedXY[x.toString() + "," + y.toString()] = true;
					
					for(var i=0; i<6; ++i) {
						var x = -1;
						var y = -1;
						
						do {
							x = Number.random(29,53);
							y = Number.random(1, 15);
						} while(usedXY[x.toString() + "," + y.toString()]);
						
						usedXY[x.toString() + "," + y.toString()] = true;
						
						me.game.add(new Shattered.Objects.NPC(x * Shattered.Settings.tileSize, y * Shattered.Settings.tileSize, { name: 'sheep', pathkey: 'random', velocity: 2 }), z);
					}
					me.game.sort();
				} // if(Scene 2)
			}
		}
	}
	
	function onNpcAction(npc) {
		
	}
	
	var ret = {
		onLevelLoaded: onLevelLoaded,
		onNpcAction: onNpcAction,
		Episode: Shattered.Enums.Episodes.Prologue,
		Scene: 2
	};
	
	return ret;
	
})();