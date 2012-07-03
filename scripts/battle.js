"use strict";

Shattered.Battle = (function() {
	
	var participants = [];
	var queue = [];
	var queueMax = 10;
	var actionQueue = [];
	var partyCount = 0;
	var enemyCount = 0;
	var current = null;
	
	function start(lstEnemies) {
		var party = Shattered.Party.Get();
		
		for(var i=0; i<lstEnemies.length; ++i)
			lstEnemies[i].type = "Enemy";
		
		participants = lstEnemies.concat(party);
		
		// for(var i=0; i< participants.length; ++i)
			// participants[i].ready = Number.random(0, 50);
		
		buildQueue();
		
		partyCount = party.length;
		enemyCount = lstEnemies.length;
	}
	
	function buildQueue() {
		queue.length = 0;
		
		var turn = 1;
		while(queue.length < queueMax) {
			for(var idx = 0; idx < participants.length; ++idx) {
				var ready = participants[idx].testTick(turn);
				if(ready >= 0)
					queue.push({ idx: idx, value: ready });
			}
			++turn;
		}
		
		queue.sort(queueSort);
	}
	
	function getOrder() {
		var tmp = [];
		for(var i=0; i<queue.length; ++i)
			tmp.push(participants[queue[i].idx].name);
		return tmp;
	}
	
	function getCurrent() {
		return current;
	}
	
	function next() {
		while(actionQueue.length === 0) {
			for(var i=0; i<participants.length; ++i) {
				var ready = participants[i].tick();
				if(ready >= 0) {
					actionQueue.push({ idx: i, value: ready });
				}
			}
			
			if(actionQueue.length) {
				actionQueue.sort(queueSort);
			}
		}
		
		current = participants[actionQueue[0].idx];
		actionQueue.shift();
		buildQueue();
		
		return current;
	}
	
	function end() {
		
	}
	
	function incapacitate(mob) {
	
	}
	
	function revive(mob) {
	
	}
	
	function queueSort(a, b) {
		return a.value - b.value;
	}
	
	var ret = {
		Start: start,
		Next: next,
		End: end,
		Incapacitate: incapacitate,
		Revive: revive
	};
	
	Object.defineProperty(ret, "Current", { get: getCurrent, enumerable: true });
	Object.defineProperty(ret, "Order", { get: getOrder, enumerable: true });
	
	return ret;
})();