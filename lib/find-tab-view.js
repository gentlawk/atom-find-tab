'use babel';

import { Disposable } from 'atom';
import SelectListView from 'atom-select-list'

export default class FindTabView {

	constructor(serializedState, callbacks) {
		this.callbacks = callbacks;

		this.element = document.createElement('div');
		this.element.classList.add('find-tab');
		this.createTabNameSelect();
	}

	serialize() {

	}

	destroy() {
		this.element.remove();
	}

	getElement() {
		return this.element;
	}

	reset() {
		this.tabNameSelect.reset();
	}

	focus() {
		this.tabNameSelect.focus();
	}

	getSelectedItem() {
		return this.tabNameSelect.getSelectedItem();
	}

	getQueryText() {
		return this.tabNameSelect.getQuery();
	}

	setQueryText(text) {
		this.tabNameSelect.refs.queryEditor.setText(text);
	}

	createTabNameSelect() {
		this.tabNameSelect = new SelectListView({
			items: [],
			elementForItem: (item) => {
				const li = document.createElement('li');
				li.classList.add('two-lines');

				const label = document.createElement('div');
				label.classList.add('primary-line', 'label');
				label.textContent = item.name;
				const addIconToElement = this.callbacks.getAddIconToElement();
				if(addIconToElement) {
					label.classList.add('icon');
					const disposable = addIconToElement(label, item.name);
				}

				const pane = document.createElement('div');
				pane.classList.add('sub-label', 'icon', 'icon-dash');
				pane.textContent = "Pane" + item.paneIndex;

				const path = document.createElement('div');
				path.classList.add('secondary-line');
				path.textContent = item.path;

				label.appendChild(pane);
				li.appendChild(label);
				li.appendChild(path);

				return li;
			},
			order: (item1, item2) => {
				return item1.name.length - item2.name.length;
			},
			filterKeyForItem: (item) => item.name,
			didConfirmSelection: () => {
				this.callbacks.onConfirm();
			},
			didConfirmEmptySelection: () => {},
			didCancelSelection: () => {
				this.callbacks.onCancel();
			},
		});
		this.element.appendChild(this.tabNameSelect.element);

		this.tabNameSelect.element.addEventListener('click', (event) => {
			event.stopPropagation();
			this.focus();
		});
	}

	refreshTabNameSelect(itemList) {
		this.tabNameSelect.update({items: itemList});
	}

	autocomplete() {
		const query = this.getQueryText();
		if(query.length < 1){
			return;
		}

		const filteredItems = this.tabNameSelect.items;
		const matchedItems = filteredItems.filter((item) => {
			return item.name.startsWith(query);
		});
		if(matchedItems.length == 0){
			return;
		}else if(matchedItems.length == 1){
			this.setQueryText(matchedItems[0].name);
			return;
		}

		let commonPart = '';
		const targetText = matchedItems[0].name;
		for(let i=0; i<targetText.length; i++){
			const subText = targetText.substring(0,i+1);
			const check = matchedItems.every((item) => item.name.startsWith(subText));
			if(check){
				commonPart = subText;
			}else{
				break;
			}
		}
		this.setQueryText(commonPart);
	}
}
