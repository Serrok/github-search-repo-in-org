window.addEventListener('popstate', onPopStateHandler);
function onPopStateHandler(e) {
	if (e.state != undefined) {
		popStateGoToRepo(e.state, 'noPushState');
	}
}
function setTitle(words) {
	return originalTitle + " - " + words;
}

React.render(<OctocatSearch />, main_stage);