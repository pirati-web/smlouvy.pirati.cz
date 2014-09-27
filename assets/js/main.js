$(document).ready(function () {
		var opts = {
			theme: 'grey',
			widthFixed: true,
			widgets: ["filter"],
			dateFormat: 'yyyymmdd',
			headers: {
				0: { sorter: "shortDate" }
			},

			// Docs: http://mottie.github.io/tablesorter/docs/example-widget-filter.html
			widgetOptions: {
				filter_columnFilters: true,
				filter_filteredRow : 'filtered',
				filter_hideFilters : false,
				filter_searchDelay : 300,
				filter_serversideFiltering : false,
				filter_defaultAttrib : 'data-value'
			}
		};
		var optsPager = {container: $("#pager")};
		$("#contracts-table")
			.tablesorter(opts)
			.tablesorterPager(optsPager);
	}
);