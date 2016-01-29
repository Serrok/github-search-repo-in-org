var popStateGoToRepo;
var urlGitHubOrgAPI = document.getElementById('main_stage').getAttribute('data-api-url');
var originalTitle = document.title;
var OctocatSearch = React.createClass({
	getInitialState: function() {
		return ({
			resultListData: [],
			displayDetail: [],
			displayDetailIndex: null,
			shallPushState: false,
			workingStage: 'search'
		});
	},
	searchRepoInOrg: function(inputValue) {
		if (this.state.workingStage == 'search') {
			var urlToCall = urlGitHubOrgAPI.replace("[ID]", inputValue);
			var ref = this;
			$.ajax({ url: urlToCall, dataType: "jsonp", success: function(resultData) {
				ref.setState({
					resultListData: resultData.data,
					workingStage: 'listResult'
				});
			}});
		} else if (this.state.workingStage == 'listResult') {
			for (var i = 0, j = this.state.resultListData.length; i < j; i++) {
				if (inputValue == this.state.resultListData[i].name) {
					this.viewSelectedRepoDetail(i);
				}
			}
		}
	},
	viewSelectedRepoDetail: function() {
		this.setState({
			displayDetailIndex: arguments[0],
			displayDetail: this.state.resultListData[arguments[0]],
			shallPushState: arguments[1] != 'noPushState'? true:false,
			workingStage: 'showDetail'
		});
	},
	navigateInRepos: function(nextRepo) {
		var navigateToRepoIdx = this.state.displayDetailIndex + nextRepo;
		if (navigateToRepoIdx <= 0) { navigateToRepoIdx = 0; }
		if (navigateToRepoIdx >= this.state.resultListData.length) { navigateToRepoIdx = this.state.resultListData.length; }
		this.viewSelectedRepoDetail(navigateToRepoIdx);
	},
	componentWillMount: function() {
		popStateGoToRepo = this.viewSelectedRepoDetail;
	},
	componentDidUpdate: function(prevProps, prevState) {
		if (this.state.workingStage == 'showDetail') {
			document.title = setTitle(this.state.resultListData[this.state.displayDetailIndex].full_name);
			if (this.state.shallPushState) {
				history.pushState(this.state.displayDetailIndex, '', '#');
			}
		}
	},
	render: function() {
		var searchConsoleActions = {
			searchRepoInOrg: this.searchRepoInOrg,
			navigateInRepos: this.navigateInRepos
		}
		var searchConsoleNaviButtonLabel = {
			prevButtonLabel: this.state.displayDetailIndex <= 0? '':this.state.resultListData[this.state.displayDetailIndex-1].name,
			nextButtonLabel: this.state.displayDetailIndex >= (this.state.resultListData.length-1)? '':this.state.resultListData[this.state.displayDetailIndex+1].name
		}
		return (
			<div>
				<OSSearchConsole workingStage={this.state.workingStage} actions={searchConsoleActions} naviButtonLabels={searchConsoleNaviButtonLabel} />
				<OSResultDetail workingStage={this.state.workingStage} displayContent={this.state.displayDetail} />
				<OSResultList workingStage={this.state.workingStage} displayList={this.state.resultListData} clickToViewDetail={this.viewSelectedRepoDetail} />
			</div>
		);
	}
});
var OSSearchConsole = React.createClass({
	getInitialState: function() {
		return ({
			naviButtonLabels: this.props.naviButtonLabels,
			workingStage: this.props.workingStage
		});
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({
			naviButtonLabels: nextProps.naviButtonLabels,
			workingStage: nextProps.workingStage
		});
	},
	searchRepoInOrg: function(e) {
		e.preventDefault();
		var searchField = document.getElementsByName('organization')[0];
		this.props.actions.searchRepoInOrg(searchField.value);
		searchField.value = '';
	},
	navigateToPrevRepo: function(e) {
		if (this.state.naviButtonLabels.prevButtonLabel != '') {
			this.props.actions.navigateInRepos(-1);
		}
	},
	navigateToNextRepo: function(e) {
		if (this.state.naviButtonLabels.nextButtonLabel != '') {
			this.props.actions.navigateInRepos(1);
		}
	},
	render: function() {
		if (this.state.workingStage == 'search') {
			return (
				<div className="search-area">
					<form action="#"  onSubmit={this.searchRepoInOrg}>
					<div className="sui-input-text">
						<label>Search an organization</label>
						<input name="organization" type="text" value="Apple" autoFocus="true" />
					</div>
					<input type="submit" className="sui-button-submit" value="List" />
					</form>
				</div>
			);
		} else if (this.state.workingStage == 'listResult') {
			return (
				<div className="search-area">
					<form action="#"  onSubmit={this.searchRepoInOrg}>
					<div className="sui-input-text">
						<label>Search a project</label>
						<input name="organization" type="text" />
					</div>
					<input type="submit" className="sui-button-submit sui-button-blue" value="Go" />
					</form>
				</div>
			);
		} else if (this.state.workingStage == 'showDetail') {
			var prevRepoDisabledClass = this.state.naviButtonLabels.prevButtonLabel == ''? ' sui-button-disabled': '';
			var nextRepoDisabledClass = this.state.naviButtonLabels.nextButtonLabel == ''? ' sui-button-disabled': '';
			return (
				<div className="search-area">
					<div className="navi-buttons">
						<div className={"sui-button" + prevRepoDisabledClass} onClick={this.navigateToPrevRepo}>{this.state.naviButtonLabels.prevButtonLabel}</div>
						<div className={"sui-button" + nextRepoDisabledClass} onClick={this.navigateToNextRepo}>{this.state.naviButtonLabels.nextButtonLabel}</div>
					</div>
				</div>
			);
		} else {
			return false;
		}
	}
});
var OSResultList = React.createClass({
	getInitialState: function() {
		return ({
			resultListData: [],
			shallHide: true
		});
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({
			resultListData: nextProps.displayList,
			shallHide: !(nextProps.workingStage == 'listResult')
		});
	},
	clickToViewDetail: function(whichOne) {
		this.props.clickToViewDetail(whichOne);
	},
	render: function() {
		if (!this.state.shallHide) {
			var thisRef = this;
			return (
				<ul className="sui-list-card result-area-list">
					{this.state.resultListData.map(function(item, i){
						return (
							<OSResultListItem key={i} data={item} itemIndex={i} clickToViewDetail={thisRef.clickToViewDetail} />
						);
					})}
				</ul>
			);
		} else {
			return false;
		}
	}
})
var OSResultListItem = React.createClass({
	onClickHandler: function(e) {
		this.props.clickToViewDetail(this.props.itemIndex);
	},
	render: function() {
		return (
			<li onClick={this.onClickHandler}>
				<div className="sui-list-item-title">{this.props.data.full_name}</div>
				<ul>
					<li>{this.props.data.description}</li>
					<li>{this.props.data.updated_at}</li>
				</ul>
			</li>
		);
	}
})
var OSResultDetail = React.createClass({
	getInitialState: function() {
		return ({
			contentData: [],
			shallHide: true
		});
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({
			contentData: nextProps.displayContent,
			shallHide: !(nextProps.workingStage == 'showDetail')
		});
	},
	render: function() {
		if (!this.state.shallHide) {
			return (
				<div className="sui-paragraph result-area-detail">
					<h2>{this.state.contentData.full_name}</h2>
					<ul>
						<li>Default Brach: {this.state.contentData.default_branch}</li>
						<li>Description: {this.state.contentData.description}</li>
						<li>Update Time: {this.state.contentData.updated_at}</li>
					</ul>
				</div>
			);
		} else {
			return false;
		}
	}
})