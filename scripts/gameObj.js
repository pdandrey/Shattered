// game resources
var g_resources = (function() {

return [
	image("Grasslands", "GrasslandV6_0_3.png"),
	image("Trees", "treesv6_0.png"),
},
{
	name: "test",
	type: "tmx",
	src: "../test.tmx"
},
{
    name: "rpg_sprite_walk",
    type: "image",
    src: "../rpg_sprite_walk.png"
},
{
	name: "sprite_healer_m",
	type: "image",
	src: "../rpgsprites1/healer_m.png"
}
];

	function image(name, filename) {
		return { name: name, type: "image", src: "../images/" + filename };
	}

	function map(name, filename) {
		return { name: name, type: "tmx", src: "../
	}
})();
