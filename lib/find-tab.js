'use babel';

import { CompositeDisposable } from 'atom';
import FindTabView from './find-tab-view';

export default {
	findTabView: null,
	modalPanel: null,
	subscriptions: null,
	addIconToElement: null,

	consumeElementIcons(service) {
	    this.addIconToElement = service;
	},

	getAddIconToElement() {
		return this.addIconToElement;
	},

	activate(state) {
		this.findTabView = new FindTabView(state.findTabViewState, {
			onConfirm: () => this.confirm(),
			onCancel: () => this.cancel(),
			getAddIconToElement: () => this.getAddIconToElement(),
		});
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.findTabView.getElement(),
			visible: false,
		});
		const clickOutside = (event) => {
			this.hide();
		};
		document.documentElement.addEventListener("click", clickOutside);
		this.modalPanel.onDidDestroy(() => {
			document.documentElement.removeEventListener("click", clickOutside);
		});

		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'find-tab:toggle': () => this.toggle()
		}));
		this.subscriptions.add(atom.commands.add('.find-tab', {
			'find-tab:autocomplete': () => this.findTabView.autocomplete(),
		}));
	},


	deactivate() {
		this.modalPanel.destroy();
		this.subscriptions.dispose();
		this.findTabView.destroy();
	},

	serialize() {
		return {
			findTabViewState: this.findTabView.serialize()
		};
	},

	show() {
		this.refreshContents();
		this.modalPanel.show();
		this.findTabView.focus();
	},

	hide() {
		this.modalPanel.hide();
	},

	toggle() {
		return (
			this.modalPanel.isVisible() ?
			this.hide() :
			this.show()
		);
	},

	getTabList() {
		const panes = atom.workspace.getPanes();
		const tabList = [];
		panes.forEach((pane, paneIndex) => {
			const items = pane.getItems();
			items.forEach((item, itemIndex) => {
				if(item.getTitle && item.getPath){
					tabList.push({
						name: item.getTitle(),
						path: this.convertPath(item.getPath()),
						paneIndex: paneIndex,
						itemIndex: itemIndex,
					});
				}
			});
		});
		return tabList;
	},

	convertPath(path) {
		atom.project.relativizePath(path);
		return atom.project.relativizePath(path)[1];
	},

	refreshContents() {
		this.findTabView.refreshTabNameSelect(this.getTabList());
		this.findTabView.reset();
	},

	activateTab(item) {
		const pane = atom.workspace.getPanes()[item.paneIndex];
		pane.activate();
		pane.activateItemAtIndex(item.itemIndex);
	},

	confirm() {
		const item = this.findTabView.getSelectedItem();
		this.activateTab(item);
		this.hide();
	},

	cancel() {
		this.hide();
	},
};
