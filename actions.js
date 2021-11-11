let tempActions = [];
const actionsWrapper = document.getElementById('actions-list');

function getActions() {
	//chrome.storage.sync.clear();
	chrome.storage.sync.get("actions", ({actions}) => {
		if (actions) {
			tempActions = actions;
			renderActions(tempActions);
		} else {
			chrome.storage.sync.set({
				actions: [
					{name: "Temp Action 1", chance: 10, amount: 10},
					{name: "Temp Action 2", chance: 90, amount: 10},
				]
			});
		}
	});
}

actionsWrapper.addEventListener('click', (event) => {
	const target = event.target;
	if (target.classList.contains('action-item-delete')) {
		deleteAction(target.dataset.name);
	}
})

function renderActions(actions) {
	if (actions.length) {
		const wrappedActions = actions.map(action => {
				return (`
						<div class="action-item">
							<span class="action-item-name">${action.name}</span>
							<span class="action-item-chance">${action.chance}%</span>
							<span class="action-item-shuffle-amount">${action.amount}</span>
							<span class="action-item-delete" data-name=${action.name.split(' ').join('')}>&times;</span>
						</div>
				`);
			}
		);
		actionsWrapper.innerHTML = wrappedActions.join(' ');
	} else {
		actionsWrapper.innerHTML = `Currently have not any actions...`;
	}

}

function deleteAction(action) {
	tempActions = tempActions.filter(act => act.name.split(' ').join('') !== action);
	chrome.storage.sync.set({actions: tempActions});
	renderActions(tempActions);
}

getActions();