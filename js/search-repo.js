'use strict';

var popStateGoToRepo;
var urlGitHubOrgAPI = document.getElementById('main_stage').getAttribute('data-api-url');
var originalTitle = document.title;
var OctocatSearch = React.createClass({
	displayName: 'OctocatSearch',

	getInitialState: function getInitialState() {
		return {
			resultListData: [],
			displayDetail: [],
			displayDetailIndex: null,
			shallPushState: false,
			workingStage: 'search'
		};
	},
	searchRepoInOrg: function searchRepoInOrg(inputValue) {
		if (this.state.workingStage == 'search') {
			var urlToCall = urlGitHubOrgAPI.replace("[ID]", inputValue);
			var ref = this;
			$.ajax({ url: urlToCall, dataType: "jsonp", success: function success(resultData) {
					ref.setState({
						resultListData: resultData.data,
						workingStage: 'listResult'
					});
				} });
		} else if (this.state.workingStage == 'listResult') {
			for (var i = 0, j = this.state.resultListData.length; i < j; i++) {
				if (inputValue == this.state.resultListData[i].name) {
					this.viewSelectedRepoDetail(i);
				}
			}
		}
	},
	viewSelectedRepoDetail: function viewSelectedRepoDetail() {
		this.setState({
			displayDetailIndex: arguments[0],
			displayDetail: this.state.resultListData[arguments[0]],
			shallPushState: arguments[1] != 'noPushState' ? true : false,
			workingStage: 'showDetail'
		});
	},
	navigateInRepos: function navigateInRepos(nextRepo) {
		var navigateToRepoIdx = this.state.displayDetailIndex + nextRepo;
		if (navigateToRepoIdx <= 0) {
			navigateToRepoIdx = 0;
		}
		if (navigateToRepoIdx >= this.state.resultListData.length) {
			navigateToRepoIdx = this.state.resultListData.length;
		}
		this.viewSelectedRepoDetail(navigateToRepoIdx);
	},
	componentWillMount: function componentWillMount() {
		popStateGoToRepo = this.viewSelectedRepoDetail;
	},
	componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
		if (this.state.workingStage == 'showDetail') {
			document.title = setTitle(this.state.resultListData[this.state.displayDetailIndex].full_name);
			if (this.state.shallPushState) {
				history.pushState(this.state.displayDetailIndex, '', '#');
			}
		}
	},
	render: function render() {
		var searchConsoleActions = {
			searchRepoInOrg: this.searchRepoInOrg,
			navigateInRepos: this.navigateInRepos
		};
		var searchConsoleNaviButtonLabel = {
			prevButtonLabel: this.state.displayDetailIndex <= 0 ? '' : this.state.resultListData[this.state.displayDetailIndex - 1].name,
			nextButtonLabel: this.state.displayDetailIndex >= this.state.resultListData.length - 1 ? '' : this.state.resultListData[this.state.displayDetailIndex + 1].name
		};
		return React.createElement(
			'div',
			null,
			React.createElement(OSSearchConsole, { workingStage: this.state.workingStage, actions: searchConsoleActions, naviButtonLabels: searchConsoleNaviButtonLabel }),
			React.createElement(OSResultDetail, { workingStage: this.state.workingStage, displayContent: this.state.displayDetail }),
			React.createElement(OSResultList, { workingStage: this.state.workingStage, displayList: this.state.resultListData, clickToViewDetail: this.viewSelectedRepoDetail })
		);
	}
});
var OSSearchConsole = React.createClass({
	displayName: 'OSSearchConsole',

	getInitialState: function getInitialState() {
		return {
			naviButtonLabels: this.props.naviButtonLabels,
			workingStage: this.props.workingStage
		};
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState({
			naviButtonLabels: nextProps.naviButtonLabels,
			workingStage: nextProps.workingStage
		});
	},
	searchRepoInOrg: function searchRepoInOrg(e) {
		e.preventDefault();
		var searchField = document.getElementsByName('organization')[0];
		this.props.actions.searchRepoInOrg(searchField.value);
		searchField.value = '';
	},
	navigateToPrevRepo: function navigateToPrevRepo(e) {
		if (this.state.naviButtonLabels.prevButtonLabel != '') {
			this.props.actions.navigateInRepos(-1);
		}
	},
	navigateToNextRepo: function navigateToNextRepo(e) {
		if (this.state.naviButtonLabels.nextButtonLabel != '') {
			this.props.actions.navigateInRepos(1);
		}
	},
	render: function render() {
		if (this.state.workingStage == 'search') {
			return React.createElement(
				'div',
				{ className: 'search-area' },
				React.createElement(
					'form',
					{ action: '#', onSubmit: this.searchRepoInOrg },
					React.createElement(
						'div',
						{ className: 'sui-input-text' },
						React.createElement(
							'label',
							null,
							'Search an organization'
						),
						React.createElement('input', { name: 'organization', type: 'text', value: 'Apple', autoFocus: 'true' })
					),
					React.createElement('input', { type: 'submit', className: 'sui-button-submit', value: 'List' })
				)
			);
		} else if (this.state.workingStage == 'listResult') {
			return React.createElement(
				'div',
				{ className: 'search-area' },
				React.createElement(
					'form',
					{ action: '#', onSubmit: this.searchRepoInOrg },
					React.createElement(
						'div',
						{ className: 'sui-input-text' },
						React.createElement(
							'label',
							null,
							'Search a project'
						),
						React.createElement('input', { name: 'organization', type: 'text' })
					),
					React.createElement('input', { type: 'submit', className: 'sui-button-submit sui-button-blue', value: 'Go' })
				)
			);
		} else if (this.state.workingStage == 'showDetail') {
			var prevRepoDisabledClass = this.state.naviButtonLabels.prevButtonLabel == '' ? ' sui-button-disabled' : '';
			var nextRepoDisabledClass = this.state.naviButtonLabels.nextButtonLabel == '' ? ' sui-button-disabled' : '';
			return React.createElement(
				'div',
				{ className: 'search-area' },
				React.createElement(
					'div',
					{ className: 'navi-buttons' },
					React.createElement(
						'div',
						{ className: "sui-button" + prevRepoDisabledClass, onClick: this.navigateToPrevRepo },
						this.state.naviButtonLabels.prevButtonLabel
					),
					React.createElement(
						'div',
						{ className: "sui-button" + nextRepoDisabledClass, onClick: this.navigateToNextRepo },
						this.state.naviButtonLabels.nextButtonLabel
					)
				)
			);
		} else {
			return false;
		}
	}
});
var OSResultList = React.createClass({
	displayName: 'OSResultList',

	getInitialState: function getInitialState() {
		return {
			resultListData: [],
			shallHide: true
		};
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState({
			resultListData: nextProps.displayList,
			shallHide: !(nextProps.workingStage == 'listResult')
		});
	},
	clickToViewDetail: function clickToViewDetail(whichOne) {
		this.props.clickToViewDetail(whichOne);
	},
	render: function render() {
		if (!this.state.shallHide) {
			var thisRef = this;
			return React.createElement(
				'ul',
				{ className: 'sui-list-card result-area-list' },
				this.state.resultListData.map(function (item, i) {
					return React.createElement(OSResultListItem, { key: i, data: item, itemIndex: i, clickToViewDetail: thisRef.clickToViewDetail });
				})
			);
		} else {
			return false;
		}
	}
});
var OSResultListItem = React.createClass({
	displayName: 'OSResultListItem',

	onClickHandler: function onClickHandler(e) {
		this.props.clickToViewDetail(this.props.itemIndex);
	},
	render: function render() {
		return React.createElement(
			'li',
			{ onClick: this.onClickHandler },
			React.createElement(
				'div',
				{ className: 'sui-list-item-title' },
				this.props.data.full_name
			),
			React.createElement(
				'ul',
				null,
				React.createElement(
					'li',
					null,
					this.props.data.description
				),
				React.createElement(
					'li',
					null,
					this.props.data.updated_at
				)
			)
		);
	}
});
var OSResultDetail = React.createClass({
	displayName: 'OSResultDetail',

	getInitialState: function getInitialState() {
		return {
			contentData: [],
			shallHide: true
		};
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState({
			contentData: nextProps.displayContent,
			shallHide: !(nextProps.workingStage == 'showDetail')
		});
	},
	render: function render() {
		if (!this.state.shallHide) {
			return React.createElement(
				'div',
				{ className: 'sui-paragraph result-area-detail' },
				React.createElement(
					'h2',
					null,
					this.state.contentData.full_name
				),
				React.createElement(
					'ul',
					null,
					React.createElement(
						'li',
						null,
						'Default Brach: ',
						this.state.contentData.default_branch
					),
					React.createElement(
						'li',
						null,
						'Description: ',
						this.state.contentData.description
					),
					React.createElement(
						'li',
						null,
						'Update Time: ',
						this.state.contentData.updated_at
					)
				)
			);
		} else {
			return false;
		}
	}
});