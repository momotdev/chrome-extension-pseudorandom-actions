let tempActions = [];
let newActionInputValue = '';

const actionsWrapper = document.getElementById('actions-list');
const actionInput = document.getElementById('new-action');
const addActionBtn = document.getElementById('add-action');
const getActionBtn = document.getElementById('get-action');

function getActions() {
	//chrome.storage.sync.clear();
	chrome.storage.sync.get("actions", ({actions}) => {
		if (actions) {
			tempActions = calculateActionsChance(actions);
			renderActions(tempActions);
		} else {
			chrome.storage.sync.set({
				actions: [
					{name: "Temp Action 1", chance: 10, amount: 10},
					{name: "Temp Action 2", chance: 10, amount: 5},
					{name: "Temp Action 3", chance: 80, amount: 34},
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
});
getActionBtn.addEventListener('click', () => {
	showRandomizedAction(getAction());
	getActions();
});

function addAction(action) {
	if (!action) return;

	const actionObject = {
		name: action,
		chance: 0,
		amount: 1
	}

	newActionInputValue = '';
	actionInput.value = '';
	chrome.storage.sync.set({
		actions: calculateActionsChance([...tempActions, actionObject])
	}).then(() => getActions());
}

function getAction() {
	const random = Math.floor(Math.random() * 100);
	const randomizedAction = calculateFortuneChances(tempActions).find(action => action.chance >= random);
	tempActions.map(action => {
		if (action.name === randomizedAction.name) action.amount++;
	})

	chrome.storage.sync.set({
		actions: tempActions
	});

	return randomizedAction;
}

function showRandomizedAction(action) {
	console.log(action)
	const resultField = document.getElementById('action-result');

	if (action) {
		if (resultField.classList.contains('action-result-hide')) {
			resultField.classList.remove('action-result-hide');
			resultField.innerHTML = action.name;
		} else {
			resultField.innerHTML = action.name;
		}
	}
}

function calculateActionsChance(actions) {
	const callsAmount = actions.reduce((acc, action) => acc + action.amount, 0);
	return actions.map(action => ({...action, chance: getPercentFromNumber(action.amount, callsAmount)}));
}

function calculateFortuneChances(actions) {
	const fortuneActions = JSON.parse(JSON.stringify(actions));
	let acc = 0;

	for (const action in fortuneActions) {
		acc += fortuneActions[action].chance;
		fortuneActions[action].chance = acc;
	}
	return fortuneActions;
}

function getPercentFromNumber(number, totalNumber) {
	return +((number / totalNumber) * 100).toFixed(1);
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
	chrome.storage.sync.set({actions: calculateActionsChance(tempActions)});
	renderActions(calculateActionsChance(tempActions));
}

getActions();

