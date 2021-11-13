chrome.contextMenus.create({
	id: 'randomizeAction',
	title: "Randomize Action",
	type: "normal",
	contexts: ["all"]
})

chrome.contextMenus.onClicked.addListener((object, tab) => {
	chrome.windows.create({
		url : "chrome-extension://hgegehjinijclkkmkefigecnlhpjkojo/actions-popup.html",
		focused : true,
		type : "popup"});
})