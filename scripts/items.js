"use strict";

Shattered.Objects.Item = Object.extend({
	init: function(name, type) {
		this.name = name;
		this.type = type;
	}
});

Shattered.Objects.UsableItem = Item.extend({
	init: function(name) {
		this.parent(name, Shattered.Enums.Items.Type.Usable);
	}
});

Shattered.Items = {
	Usable: {
		"Potion": new Shattered.Objects.UsableItem("Potion");
	}
}