'use strict';

window.addEventListener('popstate', onPopStateHandler);
function onPopStateHandler(e) {
	if (e.state != undefined) {
		popStateGoToRepo(e.state, 'noPushState');
	}
}
function setTitle(words) {
	return originalTitle + " - " + words;
}

React.render(React.createElement(OctocatSearch, null), main_stage);