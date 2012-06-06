
Shattered.Objects.DialogBoxHUD = me.HUD_Item.extend({
	init: function(x, y, height) {
		this.parent(x, y);
		this.height = height;
		this.padding = { top: 10, left: 15, right: 25, bottom: 10, portraitLeft: 15 };
		this.textMeasured = false;
		this.fontSize = 18;
		this.scrollOffset = 0;
	},
	
	scroll: function(direction) {
		if(direction == "up") {
			this.scrollOffset = Math.max(0, this.scrollOffset -= 4);
			me.game.HUD.HUD_invalidated = true;
		} else if(direction == "down") {
			this.scrollOffset = Math.min(this.maxScroll, this.scrollOffset + 4);
			me.game.HUD.HUD_invalidated = true;
		}
	},
	
	draw: function(context, x, y) {
		if(this.value) {
			context.fillStyle="#2D26FF";
			context.fillRect(0,0,Shattered.Settings.width,this.height);
			
			var portraitWidth = 0;
			var x = this.padding.left;
			
			context.fillStyle = "white"
			var border = 3;
			context.roundRect(border, border, Shattered.Settings.width - border*2, this.height-border*2, 5, true, true);
			context.fillStyle="#2D26FF";
			border = 6;
			context.roundRect(border, border, Shattered.Settings.width - border*2, this.height-border*2, 5, true, true);
			
			if(this.portrait) {
				portraitWidth = 48 + this.padding.portraitLeft;
				x = this.padding.left + 48 + this.padding.portraitLeft;
				
				var image = me.loader.getImage(this.portrait.resource);
				var imgX = this.portrait.index % 6;
				var imgY = parseInt(this.portrait.index / 6);
				
				context.drawImage(image, imgX * 48, imgY * 48, 48, 48, this.padding.left, this.padding.top, 48, 48);
			}
			
			var textWidth = Shattered.Settings.width - this.padding.left - this.padding.right - portraitWidth;
			
			context.beginPath();
			context.rect(x, this.padding.top, textWidth, this.height-this.padding.top-this.padding.bottom);
			context.clip();
			
			context.fillStyle="white";
			context.font = this.fontSize + "px Arial";
			
			if(!this.textMeasured) {
				var split = this.value.split('\n');
				var out = [];
				for(var i=0; i<split.length;) {
					var index = split[i].length;
					while(index > 0 && context.measureText(split[i].substr(0, index)).width > textWidth) {
						index = split[i].lastIndexOf(' ', index-1);
					}
					if(index != split[i].length) {
						out.push(split[i].substr(0,index));
						split[i] = split[i].substr(index+1);
					} else {
						out.push(split[i]);
						++i;
					}
				}
				this.value = out;
				var textHeight = (this.fontSize * out.length);
				this.maxScroll = Math.max(0, textHeight - (this.height - this.padding.top - this.padding.bottom));
				this.textMeasured = true;
			}
			
			var y2 = this.fontSize + this.padding.top - this.scrollOffset;
			var i = parseInt(Math.abs(this.scrollOffset) / this.fontSize);
			var y = y2 + (i * this.fontSize);
			for(; i<this.value.length && y < this.height + this.fontSize; ++i, y+= this.fontSize) {
				if(y < 0 || y > this.height + this.fontSize)
					console.log("Drawing offscreen dialog");
				context.fillText(this.value[i], x, y);
			}
		}
	}
});

Shattered.Objects.BasicDialog = Object.extend({
	
	init: function(mode, baseText) {
		this.dialog = Array.isArray(baseText) ? baseText : [ baseText ];
		this.mode = mode;
		this.index = 0;
	},
	
	addText: function() {
		for(var i=0; i<arguments.length; ++i) {
			this.dialog.push(arguments[i]);
		}
	},
	
	getText: function() {
		if(this.mode === Shattered.Enums.DialogOptions.MODE.RANDOM) {
			this.index = Number.random(0, this.dialog.length - 1);
		} 
		var ret = this.dialog[this.index];
		this.index = (this.index + 1) % this.dialog.length;
		
		if(typeof(ret) === "string")
			ret = { text: ret };
		
		return ret;
	}
});

Shattered.Objects.FullDialog = Shattered.Objects.BasicDialog.extend({
	
	// dialog: [ { portraitKey: string, text: string } ]
	init: function(dialog, settings) {
		this.parent(Shattered.Enums.DialogOptions.MODE.SEQUENTIAL, dialog);
		settings = settings || {};
		this.settings = {
			count: settings.count || -1, 
			trigger: settings.trigger || Shattered.Enums.DialogOptions.Trigger.Talk, 
			onFinish: settings.onFinish || null,
			allowNpcMovement: settings.allowNpcMovement || false
		};
	},
	
	getText: function() {
		if(this.settings.count != 0) {
			this.settings.count--;
			return this.dialog;
		} else {
			return null;
		}
	}
});

Shattered.Objects.DialogBox = (function() {

	var hud = null;
	var isInDialog = null;
	var currentDialog = null;
	var sourceNpc = null;
	
	function advanceText(dialog) {
		
		var text = dialog.text[dialog.textIndex];
		
		dialog.textIndex++;
		
		if(text.portraitKey || (sourceNpc && sourceNpc.settings && sourceNpc.settings.portraitkey)) {
			hud.portrait = Shattered.Game.Resources.portraits[text.portraitKey || sourceNpc.settings.portraitkey];
		} else {
			hud.portrait = null;
		}
		
		me.game.HUD.setItemValue("dialog", text.text); 
		hud.textMeasured = false;
		hud.maxScroll = null;
		hud.scrollOffset = 0;
		isInDialog = true;
	}

	return me.InvisibleEntity.extend({
		
		init: function(x, y, height) {
			hud = new Shattered.Objects.DialogBoxHUD(x, y, height); 
			dialogActive = false;
			settings = { 
				name: "DialogController"
			};
			this.parent(0,0,settings);
			this.z = 7;
		},
		
		getHUD: function() { return hud; },
		isInDialog: function() { return isInDialog; },
		setText: function(dialog, npc) { 
			var text = dialog.getText();
			this.text = Array.isArray(text) ? text : [ text ];
			this.textIndex = 0;
			currentDialog = dialog;
			sourceNpc = npc;
			Shattered.Game.Control = Shattered.Enums.Control.Dialog;
			if(dialog.settings && dialog.settings.allowNpcMovement)
				Shattered.Game.Control |= Shattered.Enums.Control.Npc;
			advanceText(this);
		},
		
		clear: function() { 
			me.game.HUD.setItemValue("dialog", null);
		 	Shattered.Game.Control = Shattered.Enums.Control.Player | Shattered.Enums.Control.Npc;
			isInDialog = false;
			if(currentDialog && currentDialog.settings && currentDialog.settings.onFinish) {
				currentDialog.settings.onFinish(sourceNpc);
			}
			currentDialog = null;
		},
		
		update: function() {
			if((Shattered.Game.Control & Shattered.Enums.Control.Dialog) !== Shattered.Enums.Control.Dialog)
				return;
			
			if(me.input.isKeyPressed("action")) {
				if(this.textIndex >= this.text.length) {
					this.clear();
				} else {
					advanceText(this);
				}
			} else if(me.input.isKeyPressed("up")) {
				hud.scroll("up");
			} else if(me.input.isKeyPressed("down")) {
				hud.scroll("down");
			}
			
		}
	});
})();
