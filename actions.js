let tempActions = [];
let newActionInputValue = '';

const actionsWrapper = document.getElementById('actions-list');
const actionInput = document.getElementById('new-action');
const addActionBtn = document.getElementById('add-action');
const getActionBtn = document.getElementById('get-action');

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
});

function getActions() {
	return chrome.storage.sync.get("actions");
}

function render() {
	getActions()
		.then(({actions}) => {
			tempActions = calculateActionsChance(actions);
			if (tempActions.length) {
				const wrappedActions = tempActions.map(action => {
						return (`
						<div class="action-item">
							<span class="action-item-name">${action.name}</span>
							<span class="action-item-chance action-badge">${action.chance}%</span>
							<span class="action-item-shuffle-amount action-badge">${action.amount} times</span>
							<span class="action-item-shuffle-amount action-badge">${action.lastRollDate}</span>
							<span class="action-item-delete" data-name=${action.name.split(' ').join('')}>Delete</span>
						</div>
				`);
					}
				);
				actionsWrapper.innerHTML = wrappedActions.join(' ');
			} else {
				actionsWrapper.innerHTML = `Currently have not any actions...`;
			}
		});
}

function getAction() {
	const randomValue = getRandomInt(1, tempActions.length + 1);
	const randomizedAction = tempActions[randomValue - 1];
	const options = {day: 'numeric', month: 'long',  year: 'numeric', hour: '2-digit', minute: '2-digit'}
	tempActions.map(action => {
		if (randomizedAction && action.name === randomizedAction.name) {
			action.amount++;
			action.lastRollDate = new Date().toLocaleDateString('ru-RU', options);
		}
	})

	saveActionsToStorage(tempActions)
		.then(_ => render());
	return randomizedAction;
}

function addAction(action) {
	if (!action) return;

	const options = {day: 'numeric', month: 'long',  year: 'numeric', hour: '2-digit', minute: '2-digit'}

	const actionObject = {
		name: action,
		chance: 0,
		amount: 1,
		lastRollDate: new Date().toLocaleDateString('ru-RU', options)
	}

	newActionInputValue = '';
	actionInput.value = '';
	saveActionsToStorage(calculateActionsChance([...tempActions, actionObject]))
		.then(_ => render());
}

function deleteAction(action) {
	tempActions = tempActions.filter(act => act.name.split(' ').join('') !== action);
	saveActionsToStorage(calculateActionsChance(tempActions))
		.then(_ => render())
}

function showRandomizedAction(action) {
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

function saveActionsToStorage(actions) {
	return chrome.storage.sync.set({actions});
}

function calculateActionsChance(actions) {
	return actions.map(action => ({...action, chance: getPercentFromNumber(1, actions.length)}));
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //Max not included
}

function getPercentFromNumber(number, totalNumber) {
	return +((number / totalNumber) * 100).toFixed(1);
}

render();

