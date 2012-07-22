Shattered.DB = (function() {

	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	if ('webkitIndexedDB' in window) {
	  window.IDBTransaction = window.webkitIDBTransaction;
	  window.IDBKeyRange = window.webkitIDBKeyRange;
	}

	var db = null;
	var request = indexedDB.open("Index Shattered");
	request.onerror = function(event) {
		console.error("Failed to open indexed db", event);
	}
	
	request.onsuccess = function(event) {
		db = request.result;
		var version = "0.61";
		if(version !== db.version) {
			console.log("upgrading version");
			var setV = db.setVersion(version);
			setV.onerror = function(event) {
				console.error("failed to update version", event);
			}
			setV.onsuccess = function(event) {
				db.deleteObjectStore("Party");
				var storeParty = db.createObjectStore("Party", { keyPath: 'Name' });
				storeParty.createIndex("IsInParty", "IsInParty", { unique: false });
				
				var clair = new Shattered.Objects.Mob({Name: 'Clair', Gender: Shattered.Enums.Gender.Female});
				clair.baseStats = Shattered.Objects.Stats.CopyFrom({Strength:7, Agility:8, Vitality:9, Intelligence:12, Mind:10, Charisma:8, HP:20, Speed:29, Range:6});
				var soulset = Shattered.SoulSets.FocusedPath.create();
				soulset.MainSoul = Shattered.Souls.Warrior;
				soulset.Powers = [];
				clair.SoulSet = soulset;
				
				var doug = new Shattered.Objects.Mob({Name: 'Doug', Gender: Shattered.Enums.Gender.Male});
				doug.baseStats = Shattered.Objects.Stats.CopyFrom({Strength:7, Agility:8, Vitality:9, Intelligence:12, Mind:10, Charisma:8, HP:20, Speed:29, Range:6});
				doug.SoulSet = Shattered.SoulSets.FocusedPath.create();
				doug.SoulSet.MainSoul = Shattered.Souls.Engineer;
				doug.SoulSet.Powers = [];
				
				Shattered.Party.Add(clair);
				Shattered.Party.Add(doug);
			}
		} else {
			console.log("database v %s opened", db.version);
		}
		
		loadActiveParty();
	}

	function loadActiveParty() {
		Shattered.Party.Clear();
		db.transaction("Party").objectStore("Party").index("IsInParty").openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if(cursor) {
				var pm = Shattered.Objects.Mob.Load(cursor.value);
				Shattered.Party.Add(pm);
				cursor.continue();
			}
		}
	}
	
	function loadFullParty(callback) {
		if(typeof(callback) !== 'function')
			throw "Must specify a callback function([party])";
			
		var party = [];
		db.transaction("Party").objectStore("Party").openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if(cursor) {
				party.push(Shattered.Objects.Mob.Load(cursor.value));
				cursor.continue();
			} else {
				callback(party);
			}
		}
	}
	
	function saveParty() {
		var party = Shattered.Party.Get();
		var store = db.transaction(["Party"], IDBTransaction.READ_WRITE).objectStore("Party");
		for(var i=0; i<party.length; ++i) {
			var pm = party[i];
			var set = pm.SoulSet;
			var obj = {
				Name: pm.Name,
				Gender: pm.Gender,
				IsInParty: 1,
				Type: pm.Type,
				SoulSet: {
					Name: set.SoulSet.Name,
					Main: set.MainSoul.Name,
					Subs: getSubSouls(set),
					Powers: getPowers(set)
				},
				Stats: getStats(pm.baseStats)
			};
			var request = store.put(obj);
			request.onsuccess = function(event) {
				console.log("put success", event);
			};
			request.onerror = function(event) {
				console.error("put error", event);
			}
		}
		
		function getSubSouls(set) {
			var ret = [];
			var sub = set.SubSouls;
			for(var i=0; i<sub.length; ++i)
				ret.push(sub[i].Name);
			return ret;
		}
		
		function getPowers(set) {
			var ret = [];
			var powers = set.Powers;
			for(var i=0; i<powers.length; ++i)
				ret.push(powers[i].Name);
			return ret;
		}
		
		function getStats(stat) {
			var ret = {};
			for(var s in stat) {
				if(typeof(stat[s]) !== 'function')
					ret[s] = stat[s];
			}
			return ret;
		}
	}
	
	return {
		Party: {
			Load: loadFullParty,
			Save: saveParty
		}
	};
})();