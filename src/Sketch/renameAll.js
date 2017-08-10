import rename from './utitls/rename'

const renameAll = (context) => {
	let sketch = context.api()
	let doc    = context.document;
	let pages  = doc.pages();
	for (var i = 0; i < pages.count(); i++) {
		renameInstanceRecursive(pages.objectAtIndex(i));
	}
	renameStyleLayer(context)
	sketch.message("🖌 Rename Done!");
};

const renameInstanceRecursive = (selected) => {
	selected.setName(rename(selected.name().toString()));
	if (selected instanceof MSSymbolInstance &&
		selected.name() != selected.symbolMaster().name().trim()) {
		selected.setName(selected.symbolMaster().name());
		updateCount++;
		return
	}
	try {
		var children = selected.layers();
		for (var i = 0; i < children.length; i++) {
			renameInstanceRecursive(children.objectAtIndex(i));
		}
	} catch (e) {
	}
};

const renameStyleLayer = (context) => {
	let document   = context.document;
	let pages      = document.pages();
	let pages_loop = pages.objectEnumerator();
	
	while (page = pages_loop.nextObject()) {
		var artboards      = page.artboards();
		var artboards_loop = artboards.objectEnumerator();
		while (artboard = artboards_loop.nextObject()) {
			renameLayers(artboard.layers(), document.documentData().layerTextStyles());
			renameLayers(artboard.layers(), document.documentData().layerStyles());
		}
	}
};

const renameLayers = (layers, document) => {
	processLayers(layers, layer => {
		let sharedStyleID = layer.style().sharedObjectID();
		let allStyles     = document.objects();
		
		let styleSearchPredicate = NSPredicate.predicateWithFormat("objectID == %@", sharedStyleID);
		let filteredStyles       = allStyles.filteredArrayUsingPredicate(styleSearchPredicate);
		
		if (filteredStyles.length) layer.setName(rename(filteredStyles[0].name()))
	});
}

const processLayers = (layers, callback) => {
	for (let i = 0; i < layers.count(); i++) {
		let layer = layers.objectAtIndex(i);
		if (layer.class() == "MSLayerGroup") {
			processLayers(layer.layers(), callback);
		} else {
			try {
				callback(layer)
			} catch (e) {
			}
		}
	}
};

export {
	renameAll
}