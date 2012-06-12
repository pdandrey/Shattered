"use strict";

Shattered.Battle = (function() {
	
	var queue = [];
	var partyCount = 0;
	var enemyCount = 0;
	
	function start(lstEnemies) {
		var party = Shattered.Party.Get();
		queue = lstEnemies.concat(party);
		
		for(var i=0; i< queue.length; ++i)
			queue[i].initative = Number.random(1, 30);
		
		queue.sort(queueSort);
		
		partyCount = party.length;
		enemyCount = lstEnemies.length;
	}
	
	function getOrder() {
		return queue.concat();
	}
	
	function getCurrent() {
		return queue[0];
	}
	
	function next() {
		var mob = queue.shift();
		queue.push(mob);
	}
	
	function end() {
		
	}
	
	function incapacitate(mob) {
	
	}
	
	function revive(mob) {
	
	}
	
	function queueSort(a, b) {
		return b.initative - a.initative;
	}
	
	var ret = {
		Start: start,
		Order: getOrder,
		Next: next,
		End: end,
		Current: getCurrent,
		Incapacitate: incapacitate
	};
	
	return ret;
})();