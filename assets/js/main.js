
function reloadTableData() {
    // Force collapse of the dropdown
    document.getElementById("endpoint-selector").blur();

    // Hide the dropdown and show the spinner
    document.getElementById("endpoint-selector").style.display = 'none';
    document.getElementById("loading-spinner").style.display = 'inline-block';

    $('#sensor-data').DataTable().ajax.reload(function() {
        // Hide the spinner and show the dropdown
        document.getElementById("loading-spinner").style.display = 'none';
        document.getElementById("endpoint-selector").style.display = 'inline-block';
    }, false);
}

  $(document).ready(function() {
    console.log('Document ready');
    // Store the API endpoint
    var selectedEndpoint = document.getElementById("endpoint-selector").value;
    var apiEndpoint = selectedEndpoint;
    // Load the selected endpoint from localStorage (or use a default if not set)
    var savedApiEndpoint = localStorage.getItem("selectedTokenApiEndpoint");
    if (savedApiEndpoint) {
      apiEndpoint = savedApiEndpoint;
      document.getElementById("endpoint-selector").value = savedApiEndpoint;  // Set the dropdown value
    }
    // var apiEndpoint = "https://i7oxndw6wa.execute-api.eu-central-1.amazonaws.com/prd/tokens"; // Production Server
    // var apiEndpoint = "https://prd.tcs31.sostark.nl/api/tokens"; // Development server

    document.getElementById("endpoint-selector").addEventListener("change", function() {
        clearInterval(intervalId);  // Clear the interval when changing the API endpoint

        apiEndpoint = document.getElementById("endpoint-selector").value;
        var table = $('#sensor-data').DataTable();

        // Update the DataTable's AJAX source with increased timeout
        table.ajax.url(apiEndpoint).load(null, false, {
            timeout: 15000  // 15 seconds
        });

        // Save the selected endpoint to localStorage
        localStorage.setItem("selectedTokenApiEndpoint", apiEndpoint);

        // Restart the interval after the data is loaded
        intervalId = setInterval(reloadTableData, 15000);
    });

    // Get the current date and time when the query is initiated
    var dateString = moment().format('YYYY-MM-DD HH:mm:ss'); // Use moment.js to create the date string

    // Define table options
    var tableOptions = {
      "ajax": {
        "url": apiEndpoint,
        "dataSrc": "tokens",
        "cache": false,
        "timeout": 15000, // Set timeout to 15 seconds
        "beforeSend": function() {
          // Update the page title before sending the request
          document.querySelector('h2').innerText = 'Token information from ' + apiEndpoint + ' - Connected since ' + dateString;
        },
        "error": function(xhr, error, thrown) {
          // Provide a custom error message or behavior
          if (xhr.status === 500) {
            // Show a custom error message for server error
            alert('An error occurred while retrieving the data. The server may be experiencing issues. Please try again later.');
          } else {
            // Show a generic error message for other errors
            alert('An error occurred while retrieving the data. Please check your internet connection and try again.');
          }
          // Clear the loading message from the DataTable
          $('#sensor-data').DataTable().clear().draw();
        }
      },
      "columns": [{
          "data": "tpid",
          "render": function(data, type, row) {
            return (data) ? data : '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            var hexId = row.tpid;
            // Extract the hexadecimal part of the tpid
            var hex = hexId.split("-")[1];
            // Convert the hexadecimal to decimal.
            var decimal = parseInt(hex, 16);
            return decimal;
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            return (row.tokenInfo && row.tokenInfo.role) ? row.tokenInfo.role : '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            return (row.tokenInfo && row.tokenInfo.subcontractor) ? row.tokenInfo.subcontractor : '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            return (row.tokenInfo && row.tokenInfo.categorywork) ? row.tokenInfo.categorywork : '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            return (row.tokenInfo && row.tokenInfo.subcategorywork) ? row.tokenInfo.subcategorywork : '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            return (row.lastanchor && row.lastanchor.anchorid) ? row.lastanchor.anchorid : '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            if (row.lastanchor && row.lastanchor.anchorid) {
              var hexId = row.lastanchor.anchorid;
              // Extract the hexadecimal part of the tpid
              var hex = hexId.split("-")[1];
              // Convert the hexadecimal to decimal and adjust for TM numbering methodology subtracting d000 or 53248.
              var decimal = parseInt(hex, 16) - 53248;
              return decimal;
            }
            return '';
          }
        },
        {
          "data": null,
          "render": function(data, type, row) {
            return (row.sensors && row.sensors.bat) ? row.sensors.bat.value : '';
          },
          "createdCell": function(cell, cellData, rowData) {
            if (rowData.sensors && rowData.sensors.bat && rowData.sensors.bat.time){
              var batDate = new Date(rowData.sensors.bat.time * 1000); // Convert timestamp to Date object
              var batDateString = moment(batDate).startOf('second').fromNow(); // Use moment.js to format the date string
              tippy(cell, {
                content: batDateString,
              });
            }
          }
        },
        {
          "data": "time",
          "render": function(data, type, row) {
            if (type === 'display' || type === 'filter') {
              var date = new Date(data * 1000); // Convert timestamp to Date object
              var dateString = moment(date).format('YYYY-MM-DD HH:mm:ss'); // Use moment.js to format the date string
              // var dateString = moment(date).startOf('second').fromNow(); // Use moment.js to format the date string
              return dateString;
            }
            return data;
          }
        }
      ],
      "columnDefs": [{
          "title": "Token (TPID)",
          "targets": 0
        },
        {
          "title": "Token (Decimal)",
          "targets": 1
        },
        {
          "title": "Role",
          "targets": 2
        },
        {
          "title": "Subcontractor",
          "targets": 3
        },
        {
          "title": "Work Category",
          "targets": 4
        },
        {
          "title": "Work Subcategory",
          "targets": 5
        },
        {
          "title": "Last Anchor (TPID)",
          "targets": 6
        },
        {
          "title": "Last Anchor (Decimal)",
          "targets": 7
        },
        {
          "title": "Battery",
          "targets": 8
        },
        {
          "title": "Time",
          "targets": 9,
          "searchBuilderType": "moment-YYYY-MM-DD HH:mm:ss"
        }
      ],
      "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
      ],
      "dom": 'QBfrtip',
      "pageLength": -1,
      "language": {
        searchBuilder: {
          clearAll: 'Reset Filters'
        }
      },
      "buttons": [
        'copy',
        'csv',
        {
          extend: 'pdf',
          orientation: 'landscape',
          pageSize: 'A3',
          download: 'open'
        },
        {
          text: 'Save Filters',
          action: function() {
            saveSearchBuilderConfigToFile();
          }
        },
        {
          text: 'Load Filters',
          action: function() {
            document.getElementById('config-file').click();
          }
        }
      ],
      // Apply good, warning, and poor colors to Time.
      "createdRow": function(row, data, dataIndex) {
        var now = moment();
        var tokenTime = moment($('td:eq(9)', row).text());
        var diffInMilliseconds = now.diff(tokenTime);
        var batteryValue = $('td:eq(8)', row).text();
        if (batteryValue !== '') {
          if (batteryValue < 2.2) {
            $('td:eq(8)', row).addClass('poor');
          } else if (batteryValue < 2.5) {
            $('td:eq(8)', row).addClass('warning');
          }
        }
        if (tokenTime !== '') {
          if (diffInMilliseconds < 1 * 60 * 60 * 1000) {
            $('td:eq(9)', row).addClass('good');
          } else if (diffInMilliseconds < 2 * 60 * 60 * 1000) {
            $('td:eq(9)', row).addClass('warning');
          }
        }
      }
    };

    // Initialize table
    console.log('Initializing table');
    var table = $('#sensor-data').DataTable(tableOptions);

    table.on('init', function() {
      // Load the searchBuilder filters from localStorage after initializing the table
      loadSearchBuilderFilters();

      // Save the searchBuilder filters to localStorage when the table is redrawn after a search
      table.on('draw', saveSearchBuilderFilters);
    });

    function saveSearchBuilderFilters() {
      var currentSearchBuilderData = JSON.stringify(table.searchBuilder.getDetails());
      var storedSearchBuilderData = localStorage.getItem('tokenSearchBuilderData');

      if (currentSearchBuilderData !== storedSearchBuilderData) {
        localStorage.setItem('tokenSearchBuilderData', currentSearchBuilderData);
        console.log('SearchBuilder filters saved:', currentSearchBuilderData);
      }
    }

    function saveSearchBuilderConfigToFile() {
      var config = JSON.stringify(table.searchBuilder.getDetails());
      var filename = 'searchBuilderConfig.json';
      var blob = new Blob([config], {
        type: 'application/json;charset=utf-8'
      });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    function loadSearchBuilderFilters() {
      var searchBuilderData = localStorage.getItem('tokenSearchBuilderData');
      if (searchBuilderData) {
        try {
          searchBuilderData = JSON.parse(searchBuilderData);
          console.log('SearchBuilder filters loaded:', searchBuilderData);
          table.searchBuilder.rebuild(searchBuilderData);
        } catch (e) {
          console.error('Error loading searchBuilder filters:', e);
        }
      } else {
        console.log('No searchBuilder filters found in localStorage');
      }
    }

    document.getElementById('config-file').addEventListener('change', loadSearchBuilderConfigFromFile);

    function loadSearchBuilderConfigFromFile(event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var configJson = JSON.parse(e.target.result);
          table.searchBuilder.rebuild(configJson);
          table.draw();
        } catch (error) {
          console.error('Error parsing the configuration file:', error);
        }

        // Clear the input value so the same file can be loaded again
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    // Reload data every 15 seconds
    var intervalId = setInterval(reloadTableData, 15000);  // Keep a reference to the interval
  });
