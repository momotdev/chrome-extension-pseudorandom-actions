let tempActions = [];
let newActionInputValue = '';

const actionsWrapper = document.getElementById('actions-list');
const actionInput = document.getElementById('new-action');
const addActionBtn = document.getElementById('add-action');

function getActions() {
	chrome.storage.sync.get("actions", ({actions}) => {
		if (actions) {
			tempActions = actions;
			renderActions(tempActions);
			calculateActionsChance(tempActions);
		} else {
			chrome.storage.sync.set({
				actions: [
					{name: "Temp Action 1", chance: 10, amount: 10},
					{name: "Temp Action 2", chance: 10, amount: 10},
					{name: "Temp Action 3", chance: 80, amount: 10},
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
actionInput.addEventListener('change', (e) => newActionInputValue = e.target.value);
addActionBtn.addEventListener('click', () => {
	if (newActionInputValue) {
		addAction(newActionInputValue);
	}
})

function addAction(action) {
	if (!action) return;

	const actionObject = {
		name: action,
		chance: 0,
		amount: 0
	}

	chrome.storage.sync.set({
		actions: calculateActionsChance([...tempActions, actionObject])
	}).then(() => getActions());
}

function calculateActionsChance(actions) {
	const callsAmount = actions.reduce((acc, action) => acc + action.amount, 0);
	return actions.map(action => ({...action, chance: getPercentFromNumber(action.amount, callsAmount)}));
}

function getPercentFromNumber(number, totalNumber) {
	return (number / totalNumber) * 100;
}

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

